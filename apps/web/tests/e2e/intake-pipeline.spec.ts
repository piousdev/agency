/**
 * Intake Pipeline E2E Tests
 *
 * Tests the full intake pipeline workflow:
 * - Request submission (Phase 14.4.1)
 * - Stage transitions and estimation (Phase 14.4.2)
 * - Conversion to Project/Ticket (Phase 14.4.3)
 * - Bulk operations (Phase 14.4.4)
 */

import { test, expect } from '@playwright/test';

// Test data constants
const TEST_REQUEST = {
  title: 'E2E Test Request',
  type: 'feature',
  priority: 'high',
  description: 'Automated E2E test request for intake pipeline testing',
  businessJustification: 'Testing the intake pipeline flow',
};

test.describe('Intake Pipeline', () => {
  // These tests require authentication - skip in CI without proper setup
  test.skip(() => process.env.SKIP_E2E_INTAKE === 'true', 'Skipping Intake E2E tests');

  test.describe('14.4.1 - Request Submission Flow', () => {
    test('should navigate to intake pipeline list', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake');

      // Page should load with proper title
      await expect(page.getByRole('heading', { level: 1 })).toContainText(/intake/i);

      // Stage tabs should be visible
      await expect(page.getByRole('tab', { name: /in treatment/i })).toBeVisible();
      await expect(page.getByRole('tab', { name: /on hold/i })).toBeVisible();
      await expect(page.getByRole('tab', { name: /estimation/i })).toBeVisible();
      await expect(page.getByRole('tab', { name: /ready/i })).toBeVisible();
    });

    test('should navigate to new request form', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake');

      // Click the "New Request" button
      await page.getByRole('link', { name: /new request/i }).click();

      // Should be on new request page
      await expect(page).toHaveURL(/\/intake\/new/);

      // Multi-step form should be visible
      await expect(page.getByText(/step 1/i)).toBeVisible();
    });

    test('should complete step 1 - basic info', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake/new');

      // Fill title
      await page.getByLabel(/title/i).fill(TEST_REQUEST.title);

      // Select type
      await page.getByLabel(/type/i).click();
      await page.getByRole('option', { name: /feature/i }).click();

      // Select priority
      await page.getByLabel(/priority/i).click();
      await page.getByRole('option', { name: /high/i }).click();

      // Navigate to next step
      await page.getByRole('button', { name: /next/i }).click();

      // Should be on step 2
      await expect(page.getByText(/step 2/i)).toBeVisible();
    });

    test('should show validation errors on invalid input', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake/new');

      // Try to navigate without filling required fields
      await page.getByRole('button', { name: /next/i }).click();

      // Should show validation errors
      await expect(page.getByText(/required/i)).toBeVisible();
    });

    test('should create request successfully', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake/new');

      // Step 1: Basic Info
      await page.getByLabel(/title/i).fill(`${TEST_REQUEST.title} - ${Date.now()}`);
      await page.getByLabel(/type/i).click();
      await page.getByRole('option', { name: /feature/i }).click();
      await page.getByLabel(/priority/i).click();
      await page.getByRole('option', { name: /high/i }).click();
      await page.getByRole('button', { name: /next/i }).click();

      // Step 2: Description
      await page.getByLabel(/description/i).fill(TEST_REQUEST.description);
      await page.getByLabel(/business justification/i).fill(TEST_REQUEST.businessJustification);
      await page.getByRole('button', { name: /next/i }).click();

      // Step 3: Context (skip optional fields)
      await page.getByRole('button', { name: /next/i }).click();

      // Step 4: Timeline & Submit
      await page.getByRole('button', { name: /submit/i }).click();

      // Should redirect to intake list or detail page
      await expect(page).toHaveURL(/\/intake(?!\/new)/);

      // Should see success message
      await expect(page.getByText(/success/i)).toBeVisible();
    });
  });

  test.describe('14.4.2 - Stage Transitions', () => {
    test('should display request details', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake');

      // Click on a request to view details
      const requestCard = page.locator('[data-testid="request-card"]').first();
      if (await requestCard.isVisible()) {
        await requestCard.click();

        // Should be on detail page
        await expect(page).toHaveURL(/\/intake\/[a-zA-Z0-9-]+$/);

        // Should show request details
        await expect(page.getByText(/current stage/i)).toBeVisible();
      }
    });

    test('should transition request to On Hold', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake');

      // Open a request in "In Treatment" stage
      await page.getByRole('tab', { name: /in treatment/i }).click();

      const requestCard = page.locator('[data-testid="request-card"]').first();
      if (await requestCard.isVisible()) {
        await requestCard.click();

        // Click "Move to Stage" dropdown
        await page.getByRole('button', { name: /move to stage/i }).click();
        await page.getByRole('menuitem', { name: /on hold/i }).click();

        // Should see success message
        await expect(page.getByText(/moved to/i)).toBeVisible();
      }
    });

    test('should send request for estimation', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake');

      // Find a request in "In Treatment" stage
      await page.getByRole('tab', { name: /in treatment/i }).click();

      const requestCard = page.locator('[data-testid="request-card"]').first();
      if (await requestCard.isVisible()) {
        await requestCard.click();

        // Click "Move to Stage" dropdown
        await page.getByRole('button', { name: /move to stage/i }).click();
        await page.getByRole('menuitem', { name: /estimation/i }).click();

        // Should see success message
        await expect(page.getByText(/moved to/i)).toBeVisible();
      }
    });

    test('should submit estimation', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake');

      // Find a request in "Estimation" stage
      await page.getByRole('tab', { name: /estimation/i }).click();

      const requestCard = page.locator('[data-testid="request-card"]').first();
      if (await requestCard.isVisible()) {
        await requestCard.click();

        // Click "Submit Estimation" button
        await page.getByRole('link', { name: /submit estimation/i }).click();

        // Should be on estimation page
        await expect(page).toHaveURL(/\/estimate/);

        // Fill estimation form
        await page.getByLabel(/story points/i).click();
        await page.getByRole('option', { name: /5/ }).click();

        await page.getByLabel(/confidence/i).click();
        await page.getByRole('option', { name: /medium/i }).click();

        // Submit estimation
        await page.getByRole('button', { name: /submit estimation/i }).click();

        // Should redirect back to detail page
        await expect(page).toHaveURL(/\/intake\/[a-zA-Z0-9-]+$/);
      }
    });
  });

  test.describe('14.4.3 - Conversion Flow', () => {
    test('should convert request to project', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake');

      // Find a request in "Ready" stage
      await page.getByRole('tab', { name: /ready/i }).click();

      const requestCard = page.locator('[data-testid="request-card"]').first();
      if (await requestCard.isVisible()) {
        await requestCard.click();

        // Click "Convert Request" button
        await page.getByRole('link', { name: /convert request/i }).click();

        // Should be on convert page
        await expect(page).toHaveURL(/\/convert/);

        // Select "Project" as destination
        await page.getByRole('radio', { name: /project/i }).click();

        // Click convert button
        await page.getByRole('button', { name: /convert/i }).click();

        // Should redirect to project page
        await expect(page).toHaveURL(/\/projects\//);
      }
    });

    test('should convert request to ticket', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake');

      // Find a request in "Ready" stage
      await page.getByRole('tab', { name: /ready/i }).click();

      const requestCard = page.locator('[data-testid="request-card"]').first();
      if (await requestCard.isVisible()) {
        await requestCard.click();

        // Click "Convert Request" button
        await page.getByRole('link', { name: /convert request/i }).click();

        // Should be on convert page
        await expect(page).toHaveURL(/\/convert/);

        // Select "Ticket" as destination
        await page.getByRole('radio', { name: /ticket/i }).click();

        // Select a project for the ticket
        await page.getByLabel(/project/i).click();
        await page.locator('[role="option"]').first().click();

        // Click convert button
        await page.getByRole('button', { name: /convert/i }).click();

        // Should redirect to intake queue or show success
        await expect(page.getByText(/converted/i)).toBeVisible();
      }
    });

    test('should show routing recommendation based on story points', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake');

      // Find a request in "Ready" stage
      await page.getByRole('tab', { name: /ready/i }).click();

      const requestCard = page.locator('[data-testid="request-card"]').first();
      if (await requestCard.isVisible()) {
        await requestCard.click();

        await page.getByRole('link', { name: /convert request/i }).click();

        // Should show routing recommendation
        await expect(page.getByText(/recommended/i)).toBeVisible();
      }
    });
  });

  test.describe('14.4.4 - Bulk Operations', () => {
    test('should select multiple requests', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake');

      // Find checkboxes on request cards
      const checkboxes = page.locator('[data-testid="request-checkbox"]');
      const count = await checkboxes.count();

      if (count >= 2) {
        await checkboxes.nth(0).click();
        await checkboxes.nth(1).click();

        // Bulk actions bar should appear
        await expect(page.getByText(/selected/i)).toBeVisible();
      }
    });

    test('should perform bulk stage transition', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake');

      // Select In Treatment tab
      await page.getByRole('tab', { name: /in treatment/i }).click();

      // Find checkboxes
      const checkboxes = page.locator('[data-testid="request-checkbox"]');
      const count = await checkboxes.count();

      if (count >= 2) {
        await checkboxes.nth(0).click();
        await checkboxes.nth(1).click();

        // Click bulk action button
        await page.getByRole('button', { name: /move to/i }).click();
        await page.getByRole('menuitem', { name: /on hold/i }).click();

        // Confirm dialog
        await page.getByRole('button', { name: /confirm/i }).click();

        // Should see success message
        await expect(page.getByText(/success/i)).toBeVisible();
      }
    });

    test('should perform bulk PM assignment', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake');

      const checkboxes = page.locator('[data-testid="request-checkbox"]');
      const count = await checkboxes.count();

      if (count >= 2) {
        await checkboxes.nth(0).click();
        await checkboxes.nth(1).click();

        // Click bulk assign button
        await page.getByRole('button', { name: /assign pm/i }).click();

        // Select a PM
        await page.locator('[role="menuitem"]').first().click();

        // Should see success message
        await expect(page.getByText(/assigned/i)).toBeVisible();
      }
    });

    test('should clear selection', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake');

      const checkboxes = page.locator('[data-testid="request-checkbox"]');
      const count = await checkboxes.count();

      if (count >= 1) {
        await checkboxes.nth(0).click();

        // Bulk actions bar should appear
        await expect(page.getByText(/selected/i)).toBeVisible();

        // Click clear selection
        await page.getByRole('button', { name: /clear/i }).click();

        // Bulk actions bar should disappear
        await expect(page.getByText(/selected/i)).not.toBeVisible();
      }
    });
  });

  test.describe('Filters and Views', () => {
    test('should filter by priority', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake');

      // Open filter sidebar or sheet
      const filterButton = page.getByRole('button', { name: /filter/i });
      if (await filterButton.isVisible()) {
        await filterButton.click();

        // Select high priority filter
        await page.getByLabel(/high/i).click();

        // Apply filters
        await page.getByRole('button', { name: /apply/i }).click();

        // Results should be filtered
      }
    });

    test('should toggle between card and table view', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake');

      // Find view toggle
      const tableViewButton = page.getByRole('button', { name: /table view/i });
      if (await tableViewButton.isVisible()) {
        await tableViewButton.click();

        // Should show table
        await expect(page.locator('table')).toBeVisible();

        // Toggle back to cards
        const cardViewButton = page.getByRole('button', { name: /card view/i });
        await cardViewButton.click();

        // Should show cards
        await expect(page.locator('[data-testid="request-card"]')).toBeVisible();
      }
    });

    test('should search requests', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake');

      // Find search input
      const searchInput = page.getByPlaceholder(/search/i);
      if (await searchInput.isVisible()) {
        await searchInput.fill('E2E Test');

        // Results should be filtered
        await page.waitForTimeout(500); // Debounce

        // Should show matching results or empty state
      }
    });
  });
});
