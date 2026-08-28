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
  await page.evaluate(() => window.dispatchEvent(new Event('offline')));
  await expect(page.locator('#offline-banner')).toBeVisible();
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

test('has no axe accessibility violations or nested complementary landmarks', async ({ page }) => {
  await page.addScriptTag({ content: axe.source });
  const results = await page.evaluate(async () => (window as typeof window & { axe: typeof axe }).axe.run());
  expect(results.violations).toEqual([]);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.locator('main aside')).toHaveCount(0);
});

test('keeps every visible click or touch target at least 44 by 44 CSS pixels', async ({ page }) => {
  const undersized = await page.evaluate(() => {
    const selectors = [
      'a[href]', 'button', 'input:not([type="file"]):not([type="checkbox"])',
      'textarea', 'select', 'label[for]', 'label.check-row', 'label.file-button',
    ];
    return [...document.querySelectorAll<HTMLElement>(selectors.join(','))]
      .filter((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
      })
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return { target: element.getAttribute('aria-label') ?? element.textContent?.trim().replace(/\s+/g, ' ').slice(0, 60) ?? element.tagName, width: rect.width, height: rect.height };
      })
      .filter(({ width, height }) => width < 44 || height < 44);
  });
  expect(undersized).toEqual([]);
});

test('fits a 390px mobile viewport without horizontal scrolling', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes('mobile'));
  const widths = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.client + 1);
  await expect(page.getByRole('link', { name: 'Build your packet' })).toBeVisible();
});

test('reopens offline after the first visit', async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name.includes('mobile'));
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await page.waitForTimeout(300);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('h1')).toContainText('Send the context.');
  await expect(page.locator('#packet-title')).toBeEditable();
  await page.locator('#packet-title').fill('Offline handoff');
  await expect(page.locator('#preview-title')).toHaveText('Offline handoff');
  await page.locator('#prepared-by').fill('Morgan Lee');
  await expect(page.locator('#preview-byline')).toHaveText('Prepared by Morgan Lee');
  await page.locator('#context-text').fill('Confirm the publishing date.');
  await page.getByRole('button', { name: 'Add to packet' }).click();
  await expect(page.locator('#preview-context')).toHaveText('1 item');
  expect(errors).toEqual([]);
});

test('uses a stale valid Plus verdict offline without attempting a network request', async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name.includes('mobile'));
  const errors: string[] = [];
  const failedRequests: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('requestfailed', (request) => {
    if (request.url().includes('/products/review-pdf-packet/verify')) failedRequests.push(request.url());
  });
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await page.evaluate(() => {
    localStorage.setItem('sb_license:review-pdf-packet', 'cached-test-license');
    localStorage.setItem('sb_license_verdict:review-pdf-packet', JSON.stringify({ valid: true, checkedAt: Date.now() - 86_400_001, reason: 'ok' }));
  });
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('#license-status')).toHaveText('Plus is unlocked offline using your last verified license.');
  await expect(page.locator('#plus-tools')).toBeVisible();
  expect(failedRequests).toEqual([]);
  expect(errors).toEqual([]);
});
