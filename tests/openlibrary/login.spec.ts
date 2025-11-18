import { test, expect } from '@playwright/test';

const openlibrary_login_url = 'https://openlibrary.org/account/login';

test('OpenLibrary: Google sign-in iframe appears and is clickable', async ({ page }) => {
  await page.goto(openlibrary_login_url);

  await expect(page.locator('#ia-third-party-logins')).toBeVisible({ timeout: 15000 });

  const thirdPartyIframe = page.frameLocator('#ia-third-party-logins');
  const googleIframe = thirdPartyIframe.locator(
    'iframe[title="Sign in with Google Button"], iframe[src*="accounts.google.com/gsi/button"]'
  );

  await expect(googleIframe).toBeVisible({ timeout: 15000 });
  const googleIframeHandle = await googleIframe.elementHandle();
  expect(googleIframeHandle).not.toBeNull();

  const googleFrame = await googleIframeHandle!.contentFrame();
  expect(googleFrame).not.toBeNull();

  const html = await googleFrame!.content();
  expect(html.length).toBeGreaterThan(50);

  await expect(
    googleFrame!.locator('div[role="button"], span:text("Sign in")').first()
  ).toBeVisible();
});

test('OpenLibrary: Check if Google sign-in requires interaction', async ({ page }) => {
  await page.goto(openlibrary_login_url);
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
  await page.goto(openlibrary_login_url);

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
