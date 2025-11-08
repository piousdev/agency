/**
 * E2E Tests for Invitation Flow
 * Tests complete invitation lifecycle:
 * 1. Internal user creates invitation
 * 2. Recipient accepts invitation and creates account
 * 3. New user can login
 */

import { test, expect } from '@playwright/test';
import path from 'path';

// Use authenticated context for invitation creation
test.use({
  storageState: path.join(__dirname, '../../.auth/internal-user.json'),
});

test.describe('Invitation Flow', () => {
  const testEmail = `test.invite.${Date.now()}@agency.test`;
  const testName = 'Test Invited User';
  const testPassword = 'SecureTestPass123!';
  let invitationToken: string | null = null;

  test.describe.serial('Complete invitation lifecycle', () => {
    test('should create invitation as internal user', async ({ page, context }) => {
      // Navigate to invite page
      await page.goto('/admin/users/invite');

      // Verify we're on the invite page
      await expect(page).toHaveTitle(/invite/i);
      await expect(page.locator('text=/invitation details/i')).toBeVisible();

      // Set up response interception to capture the invitation token
      const responsePromise = page.waitForResponse(
        (response) =>
          response.url().includes('/api/invitations/create') && response.status() === 200,
        { timeout: 15000 }
      );

      // Fill in email
      await page.getByLabel(/email/i).fill(testEmail);

      // Select client type
      // First try to find the Select component trigger
      const selectTrigger = page
        .locator('button[role="combobox"], button:has-text("Select")')
        .first();
      await selectTrigger.click();

      // Wait for dropdown to appear and select "Creative"
      await page.locator('[role="option"]:has-text("Creative")').first().click();

      // Submit form
      await page.getByRole('button', { name: /send invitation/i }).click();

      // Capture the API response
      try {
        const response = await responsePromise;
        const data = await response.json();

        if (data.token) {
          invitationToken = data.token;
          console.log('✓ Captured invitation token from API:', invitationToken);
        } else {
          console.log('⚠️  API response:', data);
        }
      } catch (error) {
        console.error('Failed to capture invitation token:', error);

        // Fallback: Try to get token from toast/page content
        await page.waitForTimeout(1000);
        const toastContent = await page.locator('[data-sonner-toast]').allTextContents();
        const allText = toastContent.join(' ');
        const match = allText.match(/accept-invite\/([a-zA-Z0-9_-]+)/);
        if (match) {
          invitationToken = match[1];
          console.log('✓ Captured invitation token from toast:', invitationToken);
        }
      }

      // Wait for success indication
      await expect(page.locator('text=/invitation sent|success/i')).toBeVisible({
        timeout: 10000,
      });

      // Verify redirect to users list
      await expect(page).toHaveURL('/admin/users', { timeout: 5000 });

      // Ensure we have the token before proceeding
      expect(invitationToken).toBeTruthy();
      console.log('✓ Invitation created successfully with token:', invitationToken);
    });

    test('should accept invitation and create account', async ({ browser }) => {
      // If we don't have the token from previous test, we need to fetch it
      // This would require calling the API directly
      if (!invitationToken) {
        console.log('⚠️  Invitation token not captured from previous test');
        console.log('   This test requires the invitation token from the previous test.');
        console.log('   You may need to manually retrieve it from the database or API.');
        test.skip();
        return;
      }

      // Create new incognito context (unauthenticated)
      const context = await browser.newContext();
      const page = await context.newPage();

      try {
        // Navigate to invitation acceptance page
        await page.goto(`/accept-invite/${invitationToken}`);

        // Wait for page to load
        await page.waitForLoadState('networkidle');

        // Verify invitation is valid and form is shown
        await expect(page.locator('text=/accept invitation/i')).toBeVisible();
        await expect(page.getByLabel(/full name/i)).toBeVisible();

        // Verify email is pre-filled
        const emailInput = page.getByLabel(/email/i);
        await expect(emailInput).toHaveValue(testEmail);
        await expect(emailInput).toBeDisabled();

        // Fill in account details
        await page.getByLabel(/full name/i).fill(testName);
        await page.getByLabel(/^password$/i).fill(testPassword);
        await page.getByLabel(/confirm password/i).fill(testPassword);

        // Submit form
        await page.getByRole('button', { name: /create account/i }).click();

        // Wait for account creation and redirect to login
        await page.waitForURL('/login', { timeout: 15000 });

        // Verify we're on login page
        await expect(page).toHaveTitle(/login/i);
        await expect(page.locator('text=/sign in|login/i')).toBeVisible();
      } finally {
        await context.close();
      }
    });

    test('should login with newly created account', async ({ browser }) => {
      // Create new incognito context
      const context = await browser.newContext();
      const page = await context.newPage();

      try {
        // Navigate to login page
        await page.goto('/login');

        // Fill in credentials
        await page.getByLabel(/email/i).fill(testEmail);
        await page.getByLabel(/password/i).fill(testPassword);

        // Submit login
        await page.getByRole('button', { name: /sign in|login/i }).click();

        // Should redirect to dashboard
        await page.waitForURL(/\/(dashboard|admin)/, { timeout: 10000 });

        // Verify we're authenticated
        await expect(
          page.locator(`[data-testid="user-menu"], nav >> text=/${testName.split(' ')[0]}/i`)
        ).toBeVisible({ timeout: 5000 });
      } finally {
        await context.close();
      }
    });

    test('should reject expired or invalid invitation tokens', async ({ browser }) => {
      const context = await browser.newContext();
      const page = await context.newPage();

      try {
        // Try with invalid token
        await page.goto('/accept-invite/invalid-token-12345');

        // Should show error message
        await expect(page.locator('text=/invalid.*invitation|expired/i')).toBeVisible({
          timeout: 5000,
        });
        await expect(page.locator('text=/go to login/i')).toBeVisible();
      } finally {
        await context.close();
      }
    });

    test('should reject reuse of already-accepted invitation token', async ({ browser }) => {
      if (!invitationToken) {
        test.skip();
        return;
      }

      const context = await browser.newContext();
      const page = await context.newPage();

      try {
        // Try to use the same token again
        await page.goto(`/accept-invite/${invitationToken}`);

        // Should show error message (token already used)
        await expect(page.locator('text=/invalid.*invitation|already.*used|expired/i')).toBeVisible(
          {
            timeout: 5000,
          }
        );
      } finally {
        await context.close();
      }
    });
  });

  test.describe('Invitation form validation', () => {
    test('should validate required fields in acceptance form', async ({ browser }) => {
      // This test would require a fresh invitation token
      // For now, we'll skip it or create a helper to generate tokens
      test.skip();
    });

    test('should validate password strength requirements', async ({ browser }) => {
      // This test would require a fresh invitation token
      test.skip();
    });

    test('should validate password confirmation match', async ({ browser }) => {
      // This test would require a fresh invitation token
      test.skip();
    });
  });

  // Cleanup test user after all tests
  test.afterAll(async ({ browser }) => {
    console.log(`\n⚠️  Manual cleanup required:`);
    console.log(`   Please delete test user: ${testEmail}`);
    console.log(`   Run: DELETE FROM "user" WHERE email = '${testEmail}';`);
    console.log(``);
  });
});
