import { expect, test } from '@playwright/test';
import axe from 'axe-core';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('loads without console or page errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.reload();
  await page.waitForLoadState('networkidle');
  expect(errors).toEqual([]);
});

test('builds and downloads a complete packet', async ({ page }) => {
  await page.locator('#packet-title').fill('Q3 launch review');
  await page.locator('#prepared-by').fill('Avery Morgan');
  await page.locator('#pdf-input').setInputFiles({ name: 'launch.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 test') });
  await page.locator('#context-location').fill('Page 4');
  await page.locator('#context-text').fill('Please confirm the launch date.');
  await page.getByRole('button', { name: 'Add to packet' }).click();
  await page.getByRole('button', { name: 'Add link' }).click();
  await page.getByLabel('Link label').fill('Campaign brief');
  await page.getByLabel('Web address').fill('https://example.com/brief');
  await page.locator('#attachment-input').setInputFiles({ name: 'timeline.txt', mimeType: 'text/plain', buffer: Buffer.from('timeline') });
  await page.locator('#sensitive-check').check();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download review packet' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('q3-launch-review-review-packet.zip');
  await expect(page.locator('#status')).toContainText('Packet downloaded');
});

test('reports clear errors and supports keyboard context entry', async ({ page }) => {
  await page.getByRole('button', { name: 'Download review packet' }).click();
  await expect(page.locator('#export-error')).toContainText('packet title');
  await expect(page.locator('#packet-title')).toBeFocused();

  await page.locator('#context-text').focus();
  await page.keyboard.type('Review this wording.');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.locator('#context-list')).toContainText('Review this wording.');
});

test('has no serious accessibility violations', async ({ page }) => {
  await page.addScriptTag({ content: axe.source });
  const results = await page.evaluate(async () => (window as typeof window & { axe: typeof axe }).axe.run());
  expect(results.violations.filter((issue) => ['serious', 'critical'].includes(issue.impact ?? ''))).toEqual([]);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('main')).toHaveCount(1);
});

test('fits a 390px mobile viewport without horizontal scrolling', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes('mobile'));
  const widths = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.client + 1);
  await expect(page.getByRole('link', { name: 'Build your packet' })).toBeVisible();
});
