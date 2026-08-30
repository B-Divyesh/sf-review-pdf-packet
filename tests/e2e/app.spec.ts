import { expect, test } from '@playwright/test';
import axe from 'axe-core';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

async function openDemo(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/demo');
  await expect(page.locator('#demo-banner')).toBeVisible();
  await expect(page.locator('#pdf-list')).toContainText('northstar-launch-review.pdf');
}

async function exportDemo(page: import('@playwright/test').Page) {
  await page.locator('#sensitive-check').check();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download review packet' }).click();
  return download;
}

test('@claim:demo-isolation keeps samples in an isolated namespace and resets them', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('review-packet:draft:v1', JSON.stringify({ title: 'Real draft', preparedBy: '', handoffNote: '', context: [], links: [] })));
  await openDemo(page);
  await expect(page.locator('#packet-title')).toHaveValue('Northstar launch review');
  const keys = await page.evaluate(() => Object.keys(localStorage));
  expect(keys).toContain('review-packet:draft:v1');
  expect(keys.some((key) => key.startsWith('demo:review-packet:'))).toBeTruthy();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('#context-list')).toContainText('annual pricing');
  expect(await page.evaluate(() => localStorage.getItem('review-packet:draft:v1'))).toContain('Real draft');
  await expect(page.locator('#demo-banner')).toContainText('saved separately from your real drafts');
});

test('@claim:demo-contents seeds the documented packet, resets it, and opens an empty builder', async ({ page }) => {
  await openDemo(page);
  await expect(page.locator('#pdf-list')).toContainText('northstar-launch-review.pdf');
  await expect(page.locator('#context-list')).toContainText('annual pricing');
  await expect(page.locator('#context-list')).toContainText('Approved');
  await expect(page.locator('#links-list input').first()).toHaveValue('Authorised launch brief');
  await expect(page.locator('#attachment-list')).toContainText('launch-review-checklist.txt');
  await expect(page.locator('#attachment-list')).toContainText('launch-timeline.txt');
  await page.locator('#packet-title').fill('Changed title');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('#packet-title')).toHaveValue('Northstar launch review');
  await page.getByRole('link', { name: 'Open empty builder' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('#packet-title')).toHaveValue('');
  expect(await page.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith('demo:review-packet:')))).toEqual([]);
});

test('@claim:local-processing @claim:text-drafts makes no cross-origin request and does not save selected files', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await openDemo(page);
  await page.locator('#attachment-input').setInputFiles({ name: 'private-note.txt', mimeType: 'text/plain', buffer: Buffer.from('private') });
  await page.locator('#packet-title').fill('Changed demo title');
  await page.waitForTimeout(250);
  expect(requests.every((url) => new URL(url).origin === 'http://127.0.0.1:4173')).toBeTruthy();
  const stored = await page.evaluate(() => JSON.stringify(localStorage));
  expect(stored).not.toContain('private-note.txt');
  await page.reload();
  await expect(page.locator('#packet-title')).toHaveValue('Changed demo title');
  await expect(page.locator('#attachment-list')).not.toContainText('private-note.txt');
  await expect(page.locator('#attachment-list')).toContainText('launch-review-checklist.txt');
});

test('@claim:pdf-size-limit accepts a 50 MiB PDF and rejects one additional byte', async ({ page }) => {
  const directory = await mkdtemp(join(tmpdir(), 'review-packet-size-'));
  const withinLimit = join(directory, 'within-limit.pdf');
  const overLimit = join(directory, 'over-limit.pdf');
  try {
    await writeFile(withinLimit, Buffer.concat([Buffer.from('%PDF-1.4\n'), Buffer.alloc(50 * 1024 * 1024 - 9)]));
    await writeFile(overLimit, Buffer.concat([Buffer.from('%PDF-1.4\n'), Buffer.alloc(50 * 1024 * 1024 - 8)]));
    await page.goto('/');
    await page.locator('#pdf-input').setInputFiles(withinLimit);
    await expect(page.locator('#pdf-list')).toContainText('within-limit.pdf');
    await page.locator('#pdf-input').setInputFiles(overLimit);
    await expect(page.locator('#status')).toContainText('larger than 50 MB');
    await expect(page.locator('#pdf-list')).toContainText('within-limit.pdf');
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('@claim:packet-export exports the seeded PDF, context, link, stylesheet, and attachments', async ({ page }) => {
  await openDemo(page);
  const download = await exportDemo(page);
  const path = await download.path();
  expect(path).not.toBeNull();
  const content = Buffer.from(await (await import('node:fs/promises')).readFile(path!)).toString('latin1');
  expect(content).toContain('index.html');
  expect(content).toContain('print.css');
  expect(content).toContain('northstar-launch-review.pdf');
  expect(content).toContain('attachments/launch-review-checklist.txt');
  expect(content).toContain('annual pricing');
  expect(content).toContain('https://example.com/northstar-launch-brief');
});

test('@claim:offline-demo reloads the populated demo offline after its first visit', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name.includes('mobile'));
  const context = await browser.newContext();
  const page = await context.newPage();
  await openDemo(page);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('#demo-banner')).toBeVisible();
  await expect(page.locator('#pdf-list')).toContainText('northstar-launch-review.pdf');
  await expect(page.locator('#context-list')).toContainText('Approved');
  await context.close();
});

test('@claim:source-links exports a safe reference without fetching its content', async ({ page }) => {
  const external: string[] = [];
  page.on('request', (request) => { if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') external.push(request.url()); });
  await openDemo(page);
  const download = await exportDemo(page);
  const path = await download.path();
  const content = Buffer.from(await (await import('node:fs/promises')).readFile(path!)).toString('latin1');
  expect(content).toContain('https://example.com/northstar-launch-brief');
  expect(external).toEqual([]);
});

test('@claim:cover-order puts the cover before review sections in the exported packet', async ({ page }) => {
  await openDemo(page);
  const download = await exportDemo(page);
  const content = Buffer.from(await (await import('node:fs/promises')).readFile((await download.path())!)).toString('latin1');
  expect(content.indexOf('class="cover"')).toBeGreaterThan(-1);
  expect(content.indexOf('class="cover"')).toBeLessThan(content.indexOf('Comments and decisions'));
  expect(content).toContain('Open northstar-launch-review.pdf');
});

test('uses plain first-screen copy and restores focus and route feedback after browser Back', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Review Packet — build PDF review packets');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Package a PDF for external review');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page).toHaveTitle('Demo — Review Packet');
  await expect(page.locator('#demo-preview-title')).toBeFocused();
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('#hero-title')).toBeFocused();
  await expect(page.locator('#route-announcer')).toHaveText('Review Packet home loaded.');
});

test('shows the populated demo packet in the first 390 px viewport', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes('mobile'));
  await openDemo(page);
  const firstViewport = await page.locator('#demo-first-preview').boundingBox();
  expect(firstViewport).not.toBeNull();
  expect(firstViewport!.y).toBeLessThan(844);
  await expect(page.locator('#demo-first-preview')).toContainText('northstar-launch-review.pdf');
  await expect(page.locator('#demo-first-preview')).toContainText('Page 3, pricing table');
  await expect(page.locator('#demo-first-preview')).toContainText('2 files included');
});

test('has complete metadata, shared skeleton, a designed 404 route, and no accessibility violations', async ({ page }) => {
  for (const route of ['/', '/demo', '/privacy/', '/terms/', '/404.html']) {
    await page.goto(route);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    await expect(page.getByRole('link', { name: /Privacy/ }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Terms/ }).first()).toBeVisible();
    await expect(page.locator('header nav a')).toHaveText(['Try sample', 'Builder', 'Privacy']);
  }
  await page.goto('/demo'); await page.addScriptTag({ content: axe.source });
  const results = await page.evaluate(async () => (window as typeof window & { axe: typeof axe }).axe.run());
  expect(results.violations).toEqual([]);
});

test('rejects invalid PDFs and fits the phone viewport without horizontal scrolling', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.locator('#pdf-input').setInputFiles({ name: 'spoofed.pdf', mimeType: 'text/plain', buffer: Buffer.from('not a PDF') });
  await expect(page.locator('#status')).toContainText('not marked as a PDF');
  if (testInfo.project.name.includes('mobile')) expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBeTruthy();
});
