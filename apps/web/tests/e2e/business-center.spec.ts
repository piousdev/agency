/**
 * Business Center E2E Tests
 *
 * Tests the complete Business Center feature including:
 * - Access control (internal users only)
 * - Intake flow (create → assign)
 * - Project assignment
 * - Capacity updates
 */

import { test, expect } from '@playwright/test';

test.describe('Business Center', () => {
  test.describe('Access Control', () => {
    test('should redirect non-internal users to dashboard', async ({ page }) => {
      // TODO: Create a non-internal test user (client)
      // For now, this test is a placeholder

      // Navigate to Business Center
      await page.goto('/dashboard/business-center');

      // Should redirect to dashboard
      await expect(page).toHaveURL('/dashboard');
    });

    test('should allow internal users to access Business Center', async ({ page }) => {
      // TODO: Use internal test user

      // Navigate to Business Center
      await page.goto('/dashboard/business-center');

      // Should stay on Business Center page
      await expect(page).toHaveURL('/dashboard/business-center');

      // Should see Business Center heading
      await expect(page.getByRole('heading', { name: /business center/i })).toBeVisible();
    });
  });

  test.describe('Intake Flow', () => {
    test('should create a new intake ticket', async ({ page }) => {
      // Navigate to Business Center
      await page.goto('/dashboard/business-center');

      // Click "New Request" button in Intake Queue section
      await page.getByRole('button', { name: /new request/i }).click();

      // Fill out intake form
      await page.getByLabel(/client/i).selectOption({ index: 1 }); // Select first client
      await page.getByLabel(/title/i).fill('Test Intake Request');
      await page.getByLabel(/description/i).fill('This is a test intake request for E2E testing');
      await page.getByLabel(/priority/i).selectOption('medium');

      // Submit form
      await page.getByRole('button', { name: /create request/i }).click();

      // Should see success message
      await expect(page.getByText(/created successfully/i)).toBeVisible();

      // Should see new ticket in Intake Queue
      await expect(page.getByText('Test Intake Request')).toBeVisible();
    });

    test('should assign intake ticket to team member', async ({ page }) => {
      // Navigate to Business Center
      await page.goto('/dashboard/business-center');

      // Assume there's an existing unassigned ticket
      // Click on first ticket in queue
      const firstTicket = page.locator('[data-testid="intake-ticket"]').first();
      await firstTicket.click();

      // Detail modal should open
      await expect(page.getByRole('dialog')).toBeVisible();

      // Click assign button
      await page.getByRole('button', { name: /assign/i }).click();

      // Select team member
      await page.locator('[data-testid="team-member-option"]').first().click();

      // Confirm assignment
      await page.getByRole('button', { name: /confirm/i }).click();

      // Should see success message
      await expect(page.getByText(/assigned successfully/i)).toBeVisible();

      // Ticket should now show assignee
      await expect(firstTicket.getByText(/assigned to/i)).toBeVisible();
    });

    test('should show capacity warning when assigning to overloaded member', async ({ page }) => {
      // Navigate to Business Center
      await page.goto('/dashboard/business-center');

      // Click on a ticket
      await page.locator('[data-testid="intake-ticket"]').first().click();

      // Click assign button
      await page.getByRole('button', { name: /assign/i }).click();

      // Select a team member at or above 100% capacity
      await page.locator('[data-testid="overloaded-member"]').first().click();

      // Should see capacity warning
      await expect(page.getByText(/at or above 100% capacity/i)).toBeVisible();
      await expect(page.getByText(/capacity warning/i)).toBeVisible();
    });
  });

  test.describe('Project Assignment', () => {
    test('should assign team members to a project', async ({ page }) => {
      // Navigate to Business Center
      await page.goto('/dashboard/business-center');

      // Find a project card in Active Work section
      const projectCard = page.locator('[data-testid="project-card"]').first();

      // Click "Change Assignee" action
      await projectCard.getByRole('button', { name: /change assignee/i }).click();

      // Assignment modal should open
      await expect(page.getByRole('dialog')).toBeVisible();

      // Select multiple team members (multi-select for projects)
      await page.locator('[data-testid="team-member-checkbox"]').nth(0).click();
      await page.locator('[data-testid="team-member-checkbox"]').nth(1).click();

      // Confirm assignment
      await page.getByRole('button', { name: /assign/i }).click();

      // Should see success message
      await expect(page.getByText(/assigned successfully/i)).toBeVisible();

      // Project card should show updated assignees
      await expect(projectCard.locator('[data-testid="assignee-avatar"]')).toHaveCount(2);
    });

    test('should update project status', async ({ page }) => {
      // Navigate to Business Center
      await page.goto('/dashboard/business-center');

      // Find a project card
      const projectCard = page.locator('[data-testid="project-card"]').first();

      // Click "Update Status" action
      await projectCard.getByRole('button', { name: /update status/i }).click();

      // Select new status
      await page.getByRole('option', { name: /in review/i }).click();

      // Confirm update
      await page.getByRole('button', { name: /update/i }).click();

      // Should see success message
      await expect(page.getByText(/status updated/i)).toBeVisible();

      // Card should show new status
      await expect(projectCard.getByText(/in review/i)).toBeVisible();
    });
  });

  test.describe('Team Capacity', () => {
    test('should update team member capacity', async ({ page }) => {
      // Navigate to Business Center
      await page.goto('/dashboard/business-center');

      // Find Team Capacity section
      const teamSection = page.locator('[data-testid="team-capacity-section"]');

      // Click "Update Capacity" for first team member
      await teamSection.locator('[data-testid="update-capacity-button"]').first().click();

      // Capacity modal should open
      await expect(page.getByRole('dialog')).toBeVisible();

      // Update capacity to 75%
      await page.getByLabel(/capacity percentage/i).fill('75');

      // Submit
      await page.getByRole('button', { name: /update/i }).click();

      // Should see success message
      await expect(page.getByText(/capacity updated/i)).toBeVisible();

      // Should see updated percentage in table
      await expect(teamSection.getByText('75%')).toBeVisible();
    });

    test('should show warning for capacity above 100%', async ({ page }) => {
      // Navigate to Business Center
      await page.goto('/dashboard/business-center');

      // Find Team Capacity section
      const teamSection = page.locator('[data-testid="team-capacity-section"]');

      // Click "Update Capacity" for first team member
      await teamSection.locator('[data-testid="update-capacity-button"]').first().click();

      // Update capacity to 150%
      await page.getByLabel(/capacity percentage/i).fill('150');

      // Should see warning message
      await expect(page.getByText(/above 100%/i)).toBeVisible();
      await expect(page.getByText(/overload/i)).toBeVisible();
    });
  });

  test.describe('Delivery Calendar', () => {
    test('should display upcoming deliveries', async ({ page }) => {
      // Navigate to Business Center
      await page.goto('/dashboard/business-center');

      // Find Delivery Calendar section
      const calendarSection = page.locator('[data-testid="delivery-calendar"]');

      // Should see calendar or timeline view
      await expect(calendarSection).toBeVisible();

      // Should see delivery dates
      await expect(calendarSection.getByText(/delivery/i)).toBeVisible();
    });

    test('should highlight dates with multiple deliveries', async ({ page }) => {
      // Navigate to Business Center
      await page.goto('/dashboard/business-center');

      // Find calendar section
      const calendarSection = page.locator('[data-testid="delivery-calendar"]');

      // Look for a badge indicating multiple deliveries
      const multiDeliveryBadge = calendarSection
        .locator('[data-testid="multiple-deliveries-badge"]')
        .first();

      if (await multiDeliveryBadge.isVisible()) {
        // Click on the date
        await multiDeliveryBadge.click();

        // Should see list of projects due on that date
        await expect(page.locator('[data-testid="delivery-project"]')).toHaveCount(2, {
          timeout: 1000,
        });
      }
    });
  });

  test.describe('Recently Completed', () => {
    test('should display recently completed projects', async ({ page }) => {
      // Navigate to Business Center
      await page.goto('/dashboard/business-center');

      // Find Recently Completed section
      const completedSection = page.locator('[data-testid="recently-completed"]');

      // Should be visible
      await expect(completedSection).toBeVisible();

      // Should show completed projects if any exist
      const completedProjects = completedSection.locator('[data-testid="completed-project"]');
      const count = await completedProjects.count();

      if (count > 0) {
        // First project should have completed status
        await expect(completedProjects.first().getByText(/completed|delivered/i)).toBeVisible();

        // Should show completion date
        await expect(
          completedProjects.first().locator('[data-testid="completion-date"]')
        ).toBeVisible();
      }
    });
  });

  test.describe('Integration Flow', () => {
    test('should complete full intake-to-project workflow', async ({ page }) => {
      // 1. Create intake ticket
      await page.goto('/dashboard/business-center');
      await page.getByRole('button', { name: /new request/i }).click();
      await page.getByLabel(/client/i).selectOption({ index: 1 });
      await page.getByLabel(/title/i).fill('E2E Integration Test Project');
      await page.getByLabel(/description/i).fill('Full workflow test');
      await page.getByLabel(/priority/i).selectOption('high');
      await page.getByRole('button', { name: /create request/i }).click();

      // 2. Assign to team member
      await page.getByText('E2E Integration Test Project').click();
      await page.getByRole('button', { name: /assign/i }).click();
      await page.locator('[data-testid="team-member-option"]').first().click();
      await page.getByRole('button', { name: /confirm/i }).click();

      // 3. Verify assignment succeeded
      await expect(page.getByText(/assigned successfully/i)).toBeVisible();

      // 4. Update capacity
      await page.locator('[data-testid="team-capacity-section"]').scrollIntoViewIfNeeded();
      await page.locator('[data-testid="update-capacity-button"]').first().click();
      await page.getByLabel(/capacity percentage/i).fill('80');
      await page.getByRole('button', { name: /update/i }).click();

      // 5. Verify workflow completed
      await expect(page.getByText(/capacity updated/i)).toBeVisible();
    });
  });
});
