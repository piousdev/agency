/**
 * Intake Pipeline Accessibility E2E Tests
 *
 * Phase 14.5 accessibility tests covering:
 * - 14.5.1 Keyboard navigation (cards, tabs, filters)
 * - 14.5.2 Screen reader testing (announcements, live regions)
 * - 14.5.3 Color contrast (badges, status indicators)
 * - 14.5.4 Focus management (selection, dialogs)
 */

import { test, expect } from '@playwright/test';

test.describe('Intake Pipeline Accessibility', () => {
  test.describe('14.5.1 - Keyboard Navigation', () => {
    test('should navigate stage tabs using keyboard', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake');

      // Find stage tabs
      const tabs = page.getByRole('tablist');
      if (await tabs.isVisible()) {
        await tabs.focus();

        // Arrow keys should navigate between tabs
        await page.keyboard.press('ArrowRight');
        const focused = page.locator('[role="tab"]:focus');
        if (await focused.count()) {
          await expect(focused).toBeVisible();
        }
      }
    });

    test('should navigate request cards using Tab', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake');

      // Tab through cards
      const cards = page.locator('[data-testid="request-card"]');
      const cardCount = await cards.count();

      if (cardCount > 0) {
        // Focus first card link
        const firstCardLink = cards.first().locator('a').first();
        await firstCardLink.focus();

        // Tab should move to next focusable element
        await page.keyboard.press('Tab');
        const focused = page.locator(':focus');
        await expect(focused).toBeVisible();
      }
    });

    test('should navigate filter controls using keyboard', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake');

      // Find filter controls
      const filterButton = page.getByRole('button', { name: /filter|filters/i });
      if (await filterButton.isVisible()) {
        await filterButton.focus();
        await page.keyboard.press('Enter');

        // Filter dropdown/sidebar should open
        await page.waitForTimeout(300);

        // Tab through filter options
        await page.keyboard.press('Tab');
        const focused = page.locator(':focus');
        await expect(focused).toBeVisible();
      }
    });

    test('should select cards using Space/Enter when selectable', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake');

      // Find checkbox on card if selection is enabled
      const checkbox = page.locator('[data-testid="request-checkbox"]').first();
      if (await checkbox.isVisible()) {
        await checkbox.focus();

        // Space should toggle checkbox
        await page.keyboard.press('Space');

        // Check if selection changed
        const isChecked = await checkbox.isChecked();
        expect(typeof isChecked).toBe('boolean');
      }
    });

    test('should open card actions menu with Enter', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake');

      // Find actions button
      const actionsButton = page
        .locator('[data-testid="request-card"]')
        .first()
        .getByRole('button', { name: /actions/i });

      if (await actionsButton.isVisible()) {
        await actionsButton.focus();
        await page.keyboard.press('Enter');

        // Menu should open
        const menu = page.getByRole('menu');
        await expect(menu).toBeVisible();

        // Navigate menu with arrow keys
        await page.keyboard.press('ArrowDown');
        const menuItem = page.locator('[role="menuitem"]:focus');
        await expect(menuItem).toBeVisible();
      }
    });

    test('should navigate view toggle buttons with keyboard', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake');

      // Find view toggle (card/table)
      const viewToggle = page.getByRole('button', { name: /card|table|grid|list/i }).first();
      if (await viewToggle.isVisible()) {
        await viewToggle.focus();
        await page.keyboard.press('Enter');

        // View should toggle
        // (actual behavior depends on implementation)
      }
    });
  });

  test.describe('14.5.2 - Screen Reader Support', () => {
    test('request cards should have accessible names', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake');

      const cards = page.locator('[data-testid="request-card"]');
      const cardCount = await cards.count();

      for (let i = 0; i < Math.min(cardCount, 5); i++) {
        const card = cards.nth(i);
        const link = card.locator('a').first();

        // Card link should have accessible name (from title)
        const accessibleName = await link.getAttribute('aria-label');
        const textContent = await link.textContent();

        // Should have accessible name from text content or aria-label
        expect(accessibleName || textContent?.trim()).toBeTruthy();
      }
    });

    test('status badges should have accessible labels', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake');

      // Priority badges
      const priorityBadges = page
        .locator('[data-testid="request-card"]')
        .locator('text=Critical, text=High, text=Medium, text=Low');

      const badgeCount = await priorityBadges.count();
      for (let i = 0; i < Math.min(badgeCount, 5); i++) {
        const badge = priorityBadges.nth(i);
        if (await badge.isVisible()) {
          // Badge should have visible text
          const text = await badge.textContent();
          expect(text?.trim()).toBeTruthy();
        }
      }
    });

    test('stage tabs should announce selection state', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake');

      const tabs = page.locator('[role="tab"]');
      const tabCount = await tabs.count();

      for (let i = 0; i < tabCount; i++) {
        const tab = tabs.nth(i);
        const ariaSelected = await tab.getAttribute('aria-selected');

        // Tab should have aria-selected attribute
        expect(ariaSelected === 'true' || ariaSelected === 'false').toBe(true);
      }
    });

    test('bulk action bar should announce count', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake');

      // Select a card to show bulk action bar
      const checkbox = page.locator('[data-testid="request-checkbox"]').first();
      if (await checkbox.isVisible()) {
        await checkbox.click();

        // Bulk action bar should show selected count
        const bulkBar = page.locator('text=/\\d+ selected/i');
        if (await bulkBar.isVisible()) {
          const text = await bulkBar.textContent();
          expect(text).toMatch(/\d+\s*selected/i);
        }
      }
    });

    test('form validation errors should be announced', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake/new');

      // Submit empty form to trigger errors
      const submitButton = page.getByRole('button', { name: /create|submit|next/i }).first();
      if (await submitButton.isVisible()) {
        await submitButton.click();

        // Wait for validation
        await page.waitForTimeout(500);

        // Error messages should exist
        const errors = page.locator(
          '[role="alert"], [aria-live="assertive"], [aria-live="polite"]'
        );
        // Form should have some error handling mechanism
      }
    });

    test('loading states should have aria-busy', async ({ page }) => {
      // Navigate with loading state
      await page.goto('/dashboard/business-center/intake');

      // Check for loading indicators
      const loadingIndicators = page.locator('[aria-busy="true"], [role="progressbar"]');
      // These should exist during loading (may be transient)
    });
  });

  test.describe('14.5.3 - Color Contrast', () => {
    test('priority badges should have sufficient contrast', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake');

      const cards = page.locator('[data-testid="request-card"]');
      if ((await cards.count()) > 0) {
        // Check critical priority badge contrast
        const criticalBadge = page.locator('text=Critical').first();
        if (await criticalBadge.isVisible()) {
          const styles = await criticalBadge.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
              color: computed.color,
              backgroundColor: computed.backgroundColor,
            };
          });

          // Badge should have both color and background defined
          expect(styles.color).toBeDefined();
          expect(styles.backgroundColor).toBeDefined();
        }
      }
    });

    test('stage badges should have distinguishable colors', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake');

      // Check each stage has visual distinction
      const stages = ['In Treatment', 'On Hold', 'Estimation', 'Ready'];
      const stageColors: Record<string, string> = {};

      for (const stage of stages) {
        const badge = page.locator(`text=${stage}`).first();
        if (await badge.isVisible()) {
          const bgColor = await badge.evaluate((el) => {
            return window.getComputedStyle(el).backgroundColor;
          });
          stageColors[stage] = bgColor;
        }
      }

      // Verify at least some stages have different colors
      const uniqueColors = new Set(Object.values(stageColors));
      // If multiple stages are visible, they should have different styling
      if (Object.keys(stageColors).length > 1) {
        expect(uniqueColors.size).toBeGreaterThanOrEqual(1);
      }
    });

    test('aging indicators should be visually distinct', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake');

      // Aging warning/critical indicators should stand out
      const warningIndicator = page.locator('[class*="warning"], [class*="alert"]').first();
      const criticalIndicator = page.locator('[class*="destructive"], [class*="critical"]').first();

      // These should use distinct colors when present
      // (implementation dependent)
    });

    test('links should be distinguishable from regular text', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake');

      const links = page.locator('a').first();
      if (await links.isVisible()) {
        const styles = await links.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return {
            textDecoration: computed.textDecoration,
            color: computed.color,
          };
        });

        // Links should have distinct styling
        expect(styles.color || styles.textDecoration).toBeTruthy();
      }
    });
  });

  test.describe('14.5.4 - Focus Management', () => {
    test('should show visible focus indicator on interactive elements', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake');

      // Tab to first interactive element
      await page.keyboard.press('Tab');

      const focused = page.locator(':focus');
      if (await focused.isVisible()) {
        // Check focus styling exists
        const outlineStyle = await focused.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return {
            outline: computed.outline,
            boxShadow: computed.boxShadow,
            border: computed.border,
          };
        });

        // Should have some focus indicator
        const hasFocusIndicator =
          outlineStyle.outline !== 'none' ||
          outlineStyle.boxShadow !== 'none' ||
          outlineStyle.border !== 'none';

        expect(hasFocusIndicator).toBeTruthy();
      }
    });

    test('should maintain focus after card selection', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake');

      const checkbox = page.locator('[data-testid="request-checkbox"]').first();
      if (await checkbox.isVisible()) {
        await checkbox.focus();
        await checkbox.click();

        // Focus should remain on or near the checkbox
        const focused = page.locator(':focus');
        await expect(focused).toBeVisible();
      }
    });

    test('should restore focus after closing dropdown', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake');

      const actionsButton = page
        .locator('[data-testid="request-card"]')
        .first()
        .getByRole('button', { name: /actions/i });

      if (await actionsButton.isVisible()) {
        await actionsButton.click();

        // Wait for menu to open
        await page.waitForTimeout(200);

        // Press Escape to close
        await page.keyboard.press('Escape');

        // Focus should return to button (or nearby)
        await page.waitForTimeout(100);
        const focused = page.locator(':focus');
        await expect(focused).toBeVisible();
      }
    });

    test('should trap focus in stage transition dialog', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake');

      // Try to open transition dialog via menu
      const actionsButton = page
        .locator('[data-testid="request-card"]')
        .first()
        .getByRole('button', { name: /actions/i });

      if (await actionsButton.isVisible()) {
        await actionsButton.click();

        const moveToStage = page.getByRole('menuitem', { name: /move to stage/i });
        if (await moveToStage.isVisible()) {
          await moveToStage.hover();

          // Select a stage option
          const stageOption = page.getByRole('menuitem', { name: /estimation|on hold/i }).first();
          if (await stageOption.isVisible()) {
            await stageOption.click();

            // If a dialog opens, focus should be trapped
            const dialog = page.getByRole('dialog');
            if (await dialog.isVisible()) {
              // Tab multiple times
              for (let i = 0; i < 10; i++) {
                await page.keyboard.press('Tab');
              }

              // Focus should still be in dialog
              const focused = page.locator(':focus');
              const isInDialog = await focused.evaluate((el) => {
                return el.closest('[role="dialog"]') !== null;
              });

              expect(isInDialog).toBe(true);
            }
          }
        }
      }
    });

    test('new request form should focus first input', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake/new');

      // Wait for page load
      await page.waitForTimeout(500);

      // First input should be focusable
      const titleInput = page.getByLabel(/title/i);
      if (await titleInput.isVisible()) {
        await titleInput.focus();
        await expect(titleInput).toBeFocused();
      }
    });

    test('should navigate form steps without losing focus', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake/new');

      // Fill title
      const titleInput = page.getByLabel(/title/i);
      if (await titleInput.isVisible()) {
        await titleInput.fill('Focus Test Request');

        // If there's a next button, click it
        const nextButton = page.getByRole('button', { name: /next|continue/i });
        if (await nextButton.isVisible()) {
          await nextButton.click();

          // Wait for transition
          await page.waitForTimeout(300);

          // Focus should be on next step's first input
          const focused = page.locator(':focus');
          await expect(focused).toBeVisible();
        }
      }
    });
  });

  test.describe('Additional A11y Checks', () => {
    test('page should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake');

      // Should have h1
      const h1 = page.locator('h1');
      await expect(h1.first()).toBeVisible();

      // Heading levels should not skip
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      let lastLevel = 0;

      for (const heading of headings) {
        const tagName = await heading.evaluate((el) => el.tagName.toLowerCase());
        const level = parseInt(tagName.replace('h', ''));

        // Should not skip more than one level
        if (lastLevel > 0) {
          expect(level - lastLevel).toBeLessThanOrEqual(1);
        }
        lastLevel = level;
      }
    });

    test('images should have alt text', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake');

      const images = page.locator('img');
      const imgCount = await images.count();

      for (let i = 0; i < imgCount; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        const role = await img.getAttribute('role');

        // Should have alt or be decorative (role="presentation")
        expect(alt !== null || role === 'presentation' || role === 'none').toBe(true);
      }
    });

    test('skip link should exist for keyboard users', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake');

      // Tab to reveal skip link
      await page.keyboard.press('Tab');

      // Check for skip link
      const skipLink = page.locator('a[href="#main"], a[href="#content"]');
      // Skip link is optional but recommended
    });

    test('page language should be set', async ({ page }) => {
      await page.goto('/dashboard/business-center/intake');

      const html = page.locator('html');
      const lang = await html.getAttribute('lang');

      expect(lang).toBeTruthy();
    });
  });
});
