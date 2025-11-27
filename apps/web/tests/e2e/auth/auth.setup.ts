/**
 * Playwright Authentication Setup
 * Creates authenticated browser context for internal user
 * State is saved and reused across tests for better performance
 */

import path from 'path';

import { test as setup, expect } from '@playwright/test';

// Path to save authenticated state
const authFile = path.join(__dirname, '../../.auth/internal-user.json');

setup('authenticate as internal user', async ({ page }) => {
  // Navigate to login page
  await page.goto('/login');

  // Wait for page to load
  await page.waitForLoadState('networkidle');

  // Fill in credentials (update with your test user credentials)
  await page.getByLabel(/email/i).fill('test.internal@agency.local');
  await page.getByLabel(/password/i).fill('testpassword123');

  // Submit login form
  await page.getByRole('button', { name: /sign in|login/i }).click();

  // Wait for redirect to dashboard (or home)
  await page.waitForURL(/\/(dashboard|admin)/);

  // Verify we're authenticated by checking for user menu or profile element
  // Adjust this selector based on your actual UI
  await expect(
    page.locator('[data-testid="user-menu"], nav >> text=/test\\.internal|logout/i')
  ).toBeVisible({ timeout: 5000 });

  // Save authentication state
  await page.context().storageState({ path: authFile });

  console.log('✓ Authentication setup complete');
});
