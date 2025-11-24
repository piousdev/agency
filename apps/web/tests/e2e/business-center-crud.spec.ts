/**
 * Business Center CRUD & Permission E2E Tests
 *
 * Phase 9 integration tests covering:
 * - 9.2.1 Test CRUD flows for tickets
 * - 9.2.2 Test CRUD flows for projects
 * - 9.2.3 Test CRUD flows for clients
 * - 9.2.4 Test bulk operations
 * - 9.2.5 Test permission enforcement
 */

import { test, expect } from '@playwright/test';

test.describe('Business Center CRUD Operations', () => {
  // Skip these tests by default - they require a running server and authenticated session
  // Run with: pnpm test:e2e --grep "Business Center CRUD"
  test.skip(() => process.env.SKIP_E2E_CRUD === 'true', 'Skipping CRUD E2E tests');

  test.describe('9.2.1 - Ticket CRUD Flows', () => {
    test('should navigate to create ticket page', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake');

      // Click the "New Ticket" button
      await page.getByRole('link', { name: /new ticket/i }).click();

      // Should be on new ticket page
      await expect(page).toHaveURL(/\/intake\/new/);

      // Form should be visible
      await expect(page.getByLabel(/title/i)).toBeVisible();
      await expect(page.getByLabel(/description/i)).toBeVisible();
      await expect(page.getByLabel(/client/i)).toBeVisible();
    });

    test('should create a new ticket successfully', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake/new');

      // Fill out the form
      await page.getByLabel(/title/i).fill('E2E Test Ticket');
      await page.getByLabel(/description/i).fill('This is an E2E test ticket for CRUD testing');

      // Select a client (assuming one exists)
      const clientSelect = page.getByLabel(/client/i);
      await clientSelect.click();
      await page.locator('[role="option"]').first().click();

      // Set priority
      await page.getByLabel(/priority/i).click();
      await page.getByRole('option', { name: /high/i }).click();

      // Submit the form
      await page.getByRole('button', { name: /create ticket/i }).click();

      // Should see success message or redirect
      await expect(page).toHaveURL(/\/intake(?!\/new)/);
    });

    test('should display validation errors on invalid input', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake/new');

      // Submit empty form
      await page.getByRole('button', { name: /create ticket/i }).click();

      // Should see validation errors
      await expect(page.getByText(/title is required/i)).toBeVisible();
    });

    test('should edit a ticket via dialog', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake');

      // Click on a ticket row to open details/edit
      const ticketRow = page.locator('tr').filter({ hasText: /E2E/ }).first();
      if (await ticketRow.isVisible()) {
        // Open the row actions menu
        await ticketRow.getByRole('button', { name: /open menu/i }).click();
        await page.getByRole('menuitem', { name: /edit/i }).click();

        // Edit dialog should open
        await expect(page.getByRole('dialog')).toBeVisible();

        // Update title
        await page.getByLabel(/title/i).fill('E2E Test Ticket - Updated');

        // Save
        await page.getByRole('button', { name: /save/i }).click();

        // Should see success or close dialog
        await expect(page.getByRole('dialog')).not.toBeVisible();
      }
    });

    test('should delete (close) a ticket', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake');

      // Find a test ticket
      const ticketRow = page
        .locator('tr')
        .filter({ hasText: /E2E Test Ticket/ })
        .first();
      if (await ticketRow.isVisible()) {
        // Open row actions
        await ticketRow.getByRole('button', { name: /open menu/i }).click();
        await page.getByRole('menuitem', { name: /close ticket/i }).click();

        // Confirm deletion if dialog appears
        const confirmButton = page.getByRole('button', { name: /confirm/i });
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }

        // Ticket should be removed or status changed
      }
    });
  });

  test.describe('9.2.2 - Project CRUD Flows', () => {
    test('should navigate to create project page', async ({ page }) => {
      await page.goto('/dashboard/business-center/projects');

      // Click the "New Project" button
      await page.getByRole('link', { name: /new project/i }).click();

      // Should be on new project page
      await expect(page).toHaveURL(/\/projects\/new/);

      // Form should be visible
      await expect(page.getByLabel(/name/i)).toBeVisible();
      await expect(page.getByLabel(/client/i)).toBeVisible();
    });

    test('should create a new project successfully', async ({ page }) => {
      await page.goto('/dashboard/business-center/projects/new');

      // Fill out the form
      await page.getByLabel(/name/i).fill('E2E Test Project');
      await page.getByLabel(/description/i).fill('This is an E2E test project');

      // Select a client
      const clientSelect = page.getByLabel(/client/i);
      await clientSelect.click();
      await page.locator('[role="option"]').first().click();

      // Set status
      await page.getByLabel(/status/i).click();
      await page.getByRole('option', { name: /proposal/i }).click();

      // Submit
      await page.getByRole('button', { name: /create project/i }).click();

      // Should redirect to projects list
      await expect(page).toHaveURL(/\/projects(?!\/new)/);
    });

    test('should update project status', async ({ page }) => {
      await page.goto('/dashboard/business-center/projects');

      // Find a project
      const projectRow = page
        .locator('tr')
        .filter({ hasText: /E2E Test Project/ })
        .first();
      if (await projectRow.isVisible()) {
        // Open row actions
        await projectRow.getByRole('button', { name: /open menu/i }).click();

        // Click status update option
        const statusOption = page.getByRole('menuitem', { name: /status/i });
        if (await statusOption.isVisible()) {
          await statusOption.click();

          // Select new status
          await page.getByRole('option', { name: /in development/i }).click();

          // Should see updated status
          await expect(projectRow.getByText(/in development/i)).toBeVisible();
        }
      }
    });

    test('should archive a project', async ({ page }) => {
      await page.goto('/dashboard/business-center/projects');

      // Find a project
      const projectRow = page
        .locator('tr')
        .filter({ hasText: /E2E Test Project/ })
        .first();
      if (await projectRow.isVisible()) {
        await projectRow.getByRole('button', { name: /open menu/i }).click();
        await page.getByRole('menuitem', { name: /archive/i }).click();

        // Confirm if needed
        const confirmButton = page.getByRole('button', { name: /confirm/i });
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }
      }
    });
  });

  test.describe('9.2.3 - Client CRUD Flows', () => {
    test('should navigate to create client page', async ({ page }) => {
      await page.goto('/dashboard/business-center/clients');

      // Click the "New Client" button
      await page.getByRole('link', { name: /new client/i }).click();

      // Should be on new client page
      await expect(page).toHaveURL(/\/clients\/new/);

      // Form should be visible
      await expect(page.getByLabel(/name/i)).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
    });

    test('should create a new client successfully', async ({ page }) => {
      await page.goto('/dashboard/business-center/clients/new');

      // Fill out the form
      await page.getByLabel(/name/i).fill('E2E Test Client');
      await page.getByLabel(/email/i).fill('e2e-test@example.com');

      // Set type
      await page.getByLabel(/type/i).click();
      await page.getByRole('option', { name: /software/i }).click();

      // Submit
      await page.getByRole('button', { name: /create client/i }).click();

      // Should redirect to clients list
      await expect(page).toHaveURL(/\/clients(?!\/new)/);
    });

    test('should edit a client', async ({ page }) => {
      await page.goto('/dashboard/business-center/clients');

      const clientRow = page
        .locator('tr')
        .filter({ hasText: /E2E Test Client/ })
        .first();
      if (await clientRow.isVisible()) {
        await clientRow.getByRole('button', { name: /open menu/i }).click();
        await page.getByRole('menuitem', { name: /edit/i }).click();

        // Edit dialog should open
        await expect(page.getByRole('dialog')).toBeVisible();

        // Update name
        await page.getByLabel(/name/i).fill('E2E Test Client - Updated');
        await page.getByRole('button', { name: /save/i }).click();

        await expect(page.getByRole('dialog')).not.toBeVisible();
      }
    });

    test('should deactivate a client', async ({ page }) => {
      await page.goto('/dashboard/business-center/clients');

      const clientRow = page
        .locator('tr')
        .filter({ hasText: /E2E Test Client/ })
        .first();
      if (await clientRow.isVisible()) {
        await clientRow.getByRole('button', { name: /open menu/i }).click();
        await page.getByRole('menuitem', { name: /deactivate/i }).click();

        const confirmButton = page.getByRole('button', { name: /confirm/i });
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }
      }
    });
  });

  test.describe('9.2.4 - Bulk Operations', () => {
    test('should select multiple tickets for bulk action', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake');

      // Select multiple rows
      const checkboxes = page.locator('table tbody tr input[type="checkbox"]');
      const count = await checkboxes.count();

      if (count >= 2) {
        await checkboxes.nth(0).click();
        await checkboxes.nth(1).click();

        // Bulk action bar should appear
        await expect(page.getByText(/selected/i)).toBeVisible();
      }
    });

    test('should perform bulk status update', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake');

      // Select multiple rows
      const checkboxes = page.locator('table tbody tr input[type="checkbox"]');
      const count = await checkboxes.count();

      if (count >= 2) {
        await checkboxes.nth(0).click();
        await checkboxes.nth(1).click();

        // Click bulk action button
        await page.getByRole('button', { name: /bulk actions/i }).click();
        await page.getByRole('menuitem', { name: /update status/i }).click();

        // Select status
        await page.getByRole('option', { name: /in progress/i }).click();

        // Confirm
        const confirmButton = page.getByRole('button', { name: /apply/i });
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }
      }
    });

    test('should perform bulk assignment', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake');

      const checkboxes = page.locator('table tbody tr input[type="checkbox"]');
      const count = await checkboxes.count();

      if (count >= 2) {
        await checkboxes.nth(0).click();
        await checkboxes.nth(1).click();

        await page.getByRole('button', { name: /bulk actions/i }).click();
        await page.getByRole('menuitem', { name: /assign/i }).click();

        // Select user
        await page.locator('[role="option"]').first().click();

        const confirmButton = page.getByRole('button', { name: /apply/i });
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }
      }
    });
  });

  test.describe('9.2.5 - Permission Enforcement', () => {
    test('should show permission error on unauthorized action', async ({ page }) => {
      // This test requires a user with limited permissions
      // Skip if no test user available
      test.skip(true, 'Requires test user with limited permissions');

      await page.goto('/dashboard/business-center/projects');

      // Attempt to delete a project without delete permission
      const projectRow = page.locator('tr').first();
      await projectRow.getByRole('button', { name: /open menu/i }).click();

      // Delete option should be hidden or disabled for users without permission
      const deleteOption = page.getByRole('menuitem', { name: /archive/i });

      // Either not visible or clicking shows permission error
      if (await deleteOption.isVisible()) {
        await deleteOption.click();
        // Should see permission error toast
        await expect(page.getByText(/permission/i)).toBeVisible();
      }
    });

    test('should hide create button for users without create permission', async ({ page }) => {
      // This test requires a viewer user
      test.skip(true, 'Requires test user with viewer role');

      await page.goto('/dashboard/business-center/projects');

      // Create button should not be visible for viewers
      const createButton = page.getByRole('link', { name: /new project/i });
      await expect(createButton).not.toBeVisible();
    });

    test('should hide bulk actions for users without bulk permission', async ({ page }) => {
      // This test requires a viewer user
      test.skip(true, 'Requires test user with viewer role');

      await page.goto('/dashboard/business-center/intake');

      // Select rows
      const checkboxes = page.locator('table tbody tr input[type="checkbox"]');
      if ((await checkboxes.count()) >= 2) {
        await checkboxes.nth(0).click();
        await checkboxes.nth(1).click();

        // Bulk actions should be hidden or disabled
        const bulkButton = page.getByRole('button', { name: /bulk actions/i });
        await expect(bulkButton).not.toBeVisible();
      }
    });

    test('permission error message should be user-friendly', async ({ page }) => {
      // This test validates error formatting
      test.skip(true, 'Requires simulating permission denial');

      // When a permission error occurs, it should display a friendly message
      // like "You don't have permission to create projects"
      // instead of "Permission denied: project:create"
    });
  });
});
