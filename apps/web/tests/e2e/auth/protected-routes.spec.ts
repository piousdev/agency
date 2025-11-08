/**
 * E2E Tests for Protected Routes
 * Tests middleware protection, role-based access control, and redirects
 */

import { test, expect } from '@playwright/test';

test.describe('Protected Routes - Unauthenticated', () => {
  test('should redirect to login when accessing protected route', async ({ page }) => {
    // Try to access protected route without authentication
    await page.goto('/admin/users');

    // Should redirect to login with returnUrl
    await expect(page).toHaveURL(/\/login\?returnUrl=/);
  });

  test('should redirect to login when accessing dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Protected Routes - Authenticated', () => {
  // Use saved authentication state
  test.use({ storageState: 'tests/.auth/internal-user.json' });

  test('should allow access to dashboard when authenticated', async ({ page }) => {
    await page.goto('/dashboard');

    // Should not redirect
    await expect(page).toHaveURL('/dashboard');

    // Should show user content
    await expect(page.locator('text=/welcome|dashboard/i')).toBeVisible({ timeout: 5000 });
  });

  test('should allow access to admin routes for internal users', async ({ page }) => {
    await page.goto('/admin/users');

    // Should not redirect
    await expect(page).toHaveURL('/admin/users');

    // Should show admin content
    await expect(page.locator('text=/users|team members/i')).toBeVisible({ timeout: 5000 });
  });

  test('should allow access to role management for internal users', async ({ page }) => {
    await page.goto('/admin/users');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Find first user in table and click to view details (if exists)
    const firstUserLink = page.locator('table a, [data-testid="user-row"] a').first();

    if (await firstUserLink.isVisible()) {
      await firstUserLink.click();

      // Should be on user detail page
      await expect(page).toHaveURL(/\/admin\/users\/[^\/]+$/);

      // Should show user details
      await expect(page.locator('text=/user details|profile/i')).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Logout Flow', () => {
  test.use({ storageState: 'tests/.auth/internal-user.json' });

  test('should logout and redirect to login', async ({ page }) => {
    await page.goto('/dashboard');

    // Click logout button (adjust selector based on your UI)
    await page.locator('[data-testid="logout-button"], button >> text=/logout|sign out/i').click();

    // Wait for logout to complete
    await page.waitForTimeout(1000);

    // Should redirect to login
    await expect(page).toHaveURL(/\/(login|$)/);

    // Try to access protected route again
    await page.goto('/dashboard');

    // Should redirect back to login (session is gone)
    await expect(page).toHaveURL(/\/login/);
  });
});
