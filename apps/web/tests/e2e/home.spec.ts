import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load and display the home page', async ({ page }) => {
    await page.goto('/');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Check that the page title is correct
    await expect(page).toHaveTitle(/Skyll Platform/i);

    // Add more assertions as your app grows
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');

    // Example: Click on a login link (update selector as needed)
    // await page.click('[data-testid="login-button"]');
    // await expect(page).toHaveURL('/login');
  });
});
