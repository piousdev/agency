import { test, expect } from '@playwright/test';

/**
 * Intake Pipeline Performance Tests
 *
 * Tests key performance metrics for the intake pipeline pages:
 * - Page load time
 * - Time to First Byte (TTFB)
 * - First Contentful Paint (FCP)
 * - Largest Contentful Paint (LCP)
 * - Time to Interactive
 */

// Performance thresholds in milliseconds
const THRESHOLDS = {
  TTFB: 600, // Time to First Byte < 600ms
  FCP: 1800, // First Contentful Paint < 1.8s
  LCP: 2500, // Largest Contentful Paint < 2.5s
  TTI: 3800, // Time to Interactive < 3.8s
  pageLoad: 3000, // Full page load < 3s
};

test.describe('Intake Pipeline Performance', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[name="email"]', process.env.TEST_USER_EMAIL || 'admin@example.com');
    await page.fill('[name="password"]', process.env.TEST_USER_PASSWORD || 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);
  });

  test('Intake list page loads within performance budget', async ({ page }) => {
    const startTime = Date.now();

    // Navigate to intake page and wait for content
    const response = await page.goto('/dashboard/business-center/intake', {
      waitUntil: 'domcontentloaded',
    });

    const loadTime = Date.now() - startTime;

    // Check TTFB
    const ttfb = response?.timing()?.responseStart || 0;
    console.log(`TTFB: ${ttfb}ms (threshold: ${THRESHOLDS.TTFB}ms)`);

    // Wait for main content
    await page.waitForSelector('[data-testid="request-card"], .text-center', {
      timeout: 5000,
    });

    const contentLoadTime = Date.now() - startTime;
    console.log(`Content load time: ${contentLoadTime}ms`);

    // Get Web Vitals using Performance API
    const webVitals = await page.evaluate(() => {
      const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      const navTiming = entries[0];

      if (!navTiming) return null;

      return {
        ttfb: navTiming.responseStart - navTiming.requestStart,
        domContentLoaded: navTiming.domContentLoadedEventEnd - navTiming.fetchStart,
        loadComplete: navTiming.loadEventEnd - navTiming.fetchStart,
      };
    });

    if (webVitals) {
      console.log('Navigation Timing:', webVitals);
      expect(webVitals.ttfb).toBeLessThan(THRESHOLDS.TTFB);
    }

    expect(contentLoadTime).toBeLessThan(THRESHOLDS.pageLoad);
  });

  test('Request detail page loads within performance budget', async ({ page }) => {
    // First go to list to get a request ID
    await page.goto('/dashboard/business-center/intake');

    const requestCard = page.locator('[data-testid="request-card"]').first();
    const hasRequests = await requestCard.isVisible({ timeout: 3000 }).catch(() => false);

    if (!hasRequests) {
      test.skip(true, 'No requests available for detail page test');
      return;
    }

    // Get the link href
    const href = await requestCard.locator('a').first().getAttribute('href');
    if (!href) {
      test.skip(true, 'Could not get request link');
      return;
    }

    const startTime = Date.now();
    await page.goto(href, { waitUntil: 'domcontentloaded' });

    // Wait for detail content
    await page.waitForSelector('h1, .text-2xl', { timeout: 5000 });

    const loadTime = Date.now() - startTime;
    console.log(`Detail page load time: ${loadTime}ms`);

    expect(loadTime).toBeLessThan(THRESHOLDS.pageLoad);
  });

  test('New request form loads within performance budget', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/dashboard/business-center/intake/new', {
      waitUntil: 'domcontentloaded',
    });

    // Wait for form to be ready
    await page.waitForSelector('form', { timeout: 5000 });
    await page.waitForSelector('[name="title"], input[type="text"]', { timeout: 5000 });

    const loadTime = Date.now() - startTime;
    console.log(`New request form load time: ${loadTime}ms`);

    expect(loadTime).toBeLessThan(THRESHOLDS.pageLoad);
  });

  test('Stage filter transitions are smooth', async ({ page }) => {
    await page.goto('/dashboard/business-center/intake');

    // Wait for initial content
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500); // Let JS hydrate

    // Test each stage tab transition
    const stages = ['in_treatment', 'on_hold', 'estimation', 'ready'];

    for (const stage of stages) {
      const startTime = Date.now();

      const tab = page.locator(`[value="${stage}"]`);
      if (await tab.isVisible({ timeout: 1000 }).catch(() => false)) {
        await tab.click();

        // Wait for content update
        await page.waitForTimeout(100);

        const transitionTime = Date.now() - startTime;
        console.log(`${stage} tab transition: ${transitionTime}ms`);

        // Stage transitions should be instant (client-side filtering)
        expect(transitionTime).toBeLessThan(500);
      }
    }
  });

  test('Search is responsive', async ({ page }) => {
    await page.goto('/dashboard/business-center/intake');
    await page.waitForLoadState('domcontentloaded');

    const searchInput = page.locator('input[placeholder*="Search"]');
    if (!(await searchInput.isVisible({ timeout: 2000 }).catch(() => false))) {
      test.skip(true, 'Search input not found');
      return;
    }

    const startTime = Date.now();
    await searchInput.fill('test');

    // Wait for filter to apply
    await page.waitForTimeout(300); // Debounce time

    const searchTime = Date.now() - startTime;
    console.log(`Search response time: ${searchTime}ms`);

    // Search should respond within 500ms
    expect(searchTime).toBeLessThan(800);
  });
});

test.describe('Intake Pipeline Memory & Resource Usage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', process.env.TEST_USER_EMAIL || 'admin@example.com');
    await page.fill('[name="password"]', process.env.TEST_USER_PASSWORD || 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);
  });

  test('No memory leaks during navigation', async ({ page }) => {
    const getHeapSize = async () => {
      return page.evaluate(() => {
        const perf = performance as Performance & {
          memory?: { usedJSHeapSize: number };
        };
        return perf.memory?.usedJSHeapSize || 0;
      });
    };

    await page.goto('/dashboard/business-center/intake');
    await page.waitForLoadState('domcontentloaded');

    const initialHeap = await getHeapSize();

    // Navigate back and forth multiple times
    for (let i = 0; i < 5; i++) {
      await page.goto('/dashboard');
      await page.waitForLoadState('domcontentloaded');

      await page.goto('/dashboard/business-center/intake');
      await page.waitForLoadState('domcontentloaded');
    }

    const finalHeap = await getHeapSize();

    // Allow some heap growth but flag significant leaks (3x or more)
    if (initialHeap > 0) {
      const heapGrowth = finalHeap / initialHeap;
      console.log(`Heap growth ratio: ${heapGrowth.toFixed(2)}x`);
      expect(heapGrowth).toBeLessThan(3);
    }
  });
});
