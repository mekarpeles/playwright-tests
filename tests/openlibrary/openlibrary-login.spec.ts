import { test, expect } from '@playwright/test';

test('OpenLibrary: Google sign-in iframe appears and is clickable', async ({
  page,
}) => {
  // Navigate to OpenLibrary login page
  await page.goto('https://openlibrary.org/account/login');

  // Robust selector: match by title OR src substring
  const iframeSelector =
    'iframe[title="Sign in with Google Button"], iframe[src*="accounts.google.com/gsi/button"]';
  const iframe = page.locator(iframeSelector);

  // Wait for the iframe element to appear and be visible
  await expect(iframe).toBeVisible({ timeout: 15000 });

  // Try to click the iframe element. Many Google sign-in flows open a popup - watch for that.
  // We race a popup wait with the click; if no popup is created, the click will still be attempted.
  const popupPromise = page.waitForEvent('popup').catch(() => null);

  // Click the iframe's center. This clicks the iframe element (allowed) and often triggers the provider flow.
  await iframe.click({ timeout: 5000 });

  // See if a popup was opened as a result of the click
  const popup = await popupPromise;
  if (popup) {
    // If a popup opened, assert it's pointed at Google accounts
    await popup.waitForLoadState('load', { timeout: 10000 }).catch(() => null);
    expect(popup.url()).toContain('accounts.google.com');
    await popup.close();
  } else {
    // If no popup, try a best-effort click inside the cross-origin iframe using frameLocator.
    // Note: you cannot read iframe-internal DOM because it's cross-origin, but Playwright can click known elements.
    const frame = page.frameLocator(iframeSelector);
    // Try clicking a likely button element inside the iframe (best-effort).
    await frame
      .locator('button, [role="button"], div')
      .first()
      .click()
      .catch(() => null);

    // As a fallback, assert that the iframe has a bounding box (visible/clickable)
    const box = await iframe.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(0);
    expect(box!.height).toBeGreaterThan(0);
  }
});
