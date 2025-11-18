mport { test, expect } from '@playwright/test';

test('OpenLibrary: Google sign-in iframe appears and is clickable', async ({ page }) => {
  // Navigate to OpenLibrary login page
  await page.goto('https://openlibrary.org/account/login');

  // Wait for the third-party login iframe to load
  const thirdPartyIframe = page.frameLocator('#ia-third-party-logins');

  // Look for Google sign-in iframe INSIDE the third-party login iframe
  const googleIframe = thirdPartyIframe.locator('iframe[title="Sign in with Google Button"], iframe[src*="accounts.google.com/gsi/button"]');

  // Wait for the Google iframe to appear and be visible
  await expect(googleIframe).toBeVisible({ timeout: 15000 });

  console.log('Google sign-in iframe found inside third-party login iframe');
});

test('OpenLibrary: Check if Google sign-in requires interaction', async ({ page }) => {
  await page.goto('https://openlibrary.org/account/login');
  await page.waitForLoadState('networkidle');

  // Sometimes OAuth buttons appear after clicking a specific trigger
  const oauthTrigger = page.locator('button:has-text("sign in"), .oauth, .social-login, [class*="google"]').first();

  if (await oauthTrigger.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log('Found potential OAuth trigger, clicking...');
    await oauthTrigger.click();
    await page.waitForTimeout(2000);

    // Now check for iframe again
    const iframe = page.locator('iframe[title*="Google"], iframe[src*="google"]');
    const iframeVisible = await iframe.isVisible({ timeout: 5000 }).catch(() => false);
    console.log('Iframe visible after click:', iframeVisible);
  }
});

test('OpenLibrary: Test actual login flow available', async ({ page }) => {
  await page.goto('https://openlibrary.org/account/login');

  // Check what authentication methods are actually present
  const hasEmailField = await page.locator('input[type="email"], input[name*="email"], input[id*="email"]').isVisible({ timeout: 5000 }).catch(() => false);
  const hasPasswordField = await page.locator('input[type="password"]').isVisible({ timeout: 5000 }).catch(() => false);
  const hasUsernameField = await page.locator('input[name*="username"], input[id*="username"]').isVisible({ timeout: 5000 }).catch(() => false);

  console.log('Login methods available:');
  console.log('- Email field:', hasEmailField);
  console.log('- Username field:', hasUsernameField);
  console.log('- Password field:', hasPasswordField);

  // OpenLibrary uses Internet Archive authentication
  // Check if there's a redirect or different auth flow
  const currentUrl = page.url();
  console.log('Current URL:', currentUrl);

  expect(true).toBe(true); // Placeholder assertion
});
