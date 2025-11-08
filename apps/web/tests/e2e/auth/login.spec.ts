/**
 * E2E Tests for Login Flow
 * Tests user authentication, form validation, and redirects
 */

import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    await expect(page).toHaveTitle(/login/i);
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in|login/i })).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    // Try to submit without filling fields
    await page.getByRole('button', { name: /sign in|login/i }).click();

    // Should show validation errors
    await expect(page.locator('text=/required|enter.*email/i')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Fill with invalid credentials
    await page.getByLabel(/email/i).fill('invalid@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in|login/i }).click();

    // Should show error message
    await expect(page.locator('text=/invalid.*credentials|incorrect.*password/i')).toBeVisible({
      timeout: 10000,
    });
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    // Fill with valid test user credentials
    await page.getByLabel(/email/i).fill('test.internal@agency.local');
    await page.getByLabel(/password/i).fill('testpassword123');
    await page.getByRole('button', { name: /sign in|login/i }).click();

    // Should redirect to dashboard or admin
    await page.waitForURL(/\/(dashboard|admin)/, { timeout: 10000 });

    // Should be authenticated
    await expect(
      page.locator('[data-testid="user-menu"], nav >> text=/test\\.internal|logout/i')
    ).toBeVisible({ timeout: 5000 });
  });

  test('should redirect to returnUrl after login', async ({ page }) => {
    // Navigate to login with returnUrl
    await page.goto('/login?returnUrl=/admin/users');

    // Login
    await page.getByLabel(/email/i).fill('test.internal@agency.local');
    await page.getByLabel(/password/i).fill('testpassword123');
    await page.getByRole('button', { name: /sign in|login/i }).click();

    // Should redirect to the returnUrl
    await expect(page).toHaveURL('/admin/users');
  });
});
