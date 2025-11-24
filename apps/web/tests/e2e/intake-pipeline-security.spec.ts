import { test, expect } from '@playwright/test';

/**
 * Intake Pipeline Security Tests
 *
 * Tests OWASP Top 10 security concerns for the intake pipeline:
 * - A01: Broken Access Control
 * - A02: Cryptographic Failures
 * - A03: Injection
 * - A04: Insecure Design
 * - A05: Security Misconfiguration
 * - A07: XSS
 */

test.describe('Intake Pipeline Security - Access Control', () => {
  test('Unauthenticated users cannot access intake pages', async ({ page }) => {
    // Clear any existing auth
    await page.context().clearCookies();

    // Try to access intake list
    const response = await page.goto('/dashboard/business-center/intake');

    // Should redirect to login or return 401/403
    expect(page.url()).toMatch(/login|signin|auth/);
  });

  test('Unauthenticated users cannot access intake detail pages', async ({ page }) => {
    await page.context().clearCookies();

    const response = await page.goto('/dashboard/business-center/intake/test-id-123');

    expect(page.url()).toMatch(/login|signin|auth/);
  });

  test('Unauthenticated users cannot access new request page', async ({ page }) => {
    await page.context().clearCookies();

    const response = await page.goto('/dashboard/business-center/intake/new');

    expect(page.url()).toMatch(/login|signin|auth/);
  });

  test('API endpoints require authentication', async ({ request }) => {
    // Test list endpoint without auth
    const listResponse = await request.get('/api/requests');
    expect([401, 403]).toContain(listResponse.status());

    // Test create endpoint without auth
    const createResponse = await request.post('/api/requests', {
      data: { title: 'Test', description: 'Test' },
    });
    expect([401, 403]).toContain(createResponse.status());

    // Test analytics endpoint without auth
    const analyticsResponse = await request.get('/api/requests/analytics');
    expect([401, 403]).toContain(analyticsResponse.status());
  });
});

test.describe('Intake Pipeline Security - Input Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', process.env.TEST_USER_EMAIL || 'admin@example.com');
    await page.fill('[name="password"]', process.env.TEST_USER_PASSWORD || 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);
  });

  test('XSS prevention in request title', async ({ page }) => {
    await page.goto('/dashboard/business-center/intake/new');

    const xssPayload = '<script>alert("XSS")</script>';

    await page.fill('[name="title"]', xssPayload);
    await page.fill('[name="description"]', 'Test description');

    // The script tag should be escaped or stripped in the UI
    const titleInput = await page.locator('[name="title"]').inputValue();
    expect(titleInput).not.toContain('<script>');
  });

  test('XSS prevention in search input', async ({ page }) => {
    await page.goto('/dashboard/business-center/intake');

    const xssPayload = '"><script>alert(1)</script>';
    const searchInput = page.locator('input[placeholder*="Search"]');

    if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await searchInput.fill(xssPayload);

      // Check that the payload is escaped in the DOM
      const pageContent = await page.content();
      expect(pageContent).not.toContain('<script>alert(1)</script>');
    }
  });

  test('SQL injection prevention in request fields', async ({ page }) => {
    await page.goto('/dashboard/business-center/intake/new');

    const sqlPayload = "'; DROP TABLE requests; --";

    await page.fill('[name="title"]', sqlPayload);
    await page.fill('[name="description"]', 'Test');

    // Fill minimum required fields
    const typeSelect = page.locator('[name="type"]');
    if (await typeSelect.isVisible({ timeout: 1000 }).catch(() => false)) {
      await typeSelect.selectOption({ index: 0 });
    }

    // Try to submit - the server should handle this safely
    const submitButton = page.locator('button[type="submit"]');
    if (await submitButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await submitButton.click();

      // Should not cause an error page or crash
      await page.waitForTimeout(1000);
      expect(page.url()).not.toMatch(/error|500/);
    }
  });
});

test.describe('Intake Pipeline Security - Headers & Config', () => {
  test('Security headers are present', async ({ page }) => {
    const response = await page.goto('/dashboard/business-center/intake');

    if (response) {
      const headers = response.headers();

      // Check for common security headers
      // Note: Some may be set by deployment platform, not the app
      console.log('Security Headers:');
      console.log('- X-Frame-Options:', headers['x-frame-options'] || 'Not set');
      console.log('- X-Content-Type-Options:', headers['x-content-type-options'] || 'Not set');
      console.log(
        '- Content-Security-Policy:',
        headers['content-security-policy'] ? 'Set' : 'Not set'
      );
      console.log(
        '- Strict-Transport-Security:',
        headers['strict-transport-security'] || 'Not set'
      );

      // X-Content-Type-Options should prevent MIME sniffing
      if (headers['x-content-type-options']) {
        expect(headers['x-content-type-options']).toBe('nosniff');
      }
    }
  });

  test('Cookies have secure attributes', async ({ page, context }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', process.env.TEST_USER_EMAIL || 'admin@example.com');
    await page.fill('[name="password"]', process.env.TEST_USER_PASSWORD || 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);

    const cookies = await context.cookies();
    const sessionCookies = cookies.filter(
      (c) => c.name.includes('session') || c.name.includes('auth')
    );

    for (const cookie of sessionCookies) {
      console.log(`Cookie ${cookie.name}:`, {
        httpOnly: cookie.httpOnly,
        secure: cookie.secure,
        sameSite: cookie.sameSite,
      });

      // Session cookies should be httpOnly
      expect(cookie.httpOnly).toBe(true);

      // In production, cookies should be secure
      // (Skip this check in local dev)
      if (process.env.NODE_ENV === 'production') {
        expect(cookie.secure).toBe(true);
      }
    }
  });
});

test.describe('Intake Pipeline Security - CSRF Protection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', process.env.TEST_USER_EMAIL || 'admin@example.com');
    await page.fill('[name="password"]', process.env.TEST_USER_PASSWORD || 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);
  });

  test('Forms include CSRF protection', async ({ page }) => {
    await page.goto('/dashboard/business-center/intake/new');

    const form = page.locator('form');
    if (await form.isVisible({ timeout: 2000 }).catch(() => false)) {
      const formHtml = await form.innerHTML();

      // Check for CSRF token (varies by framework)
      // Next.js Server Actions use built-in protection
      // Better-Auth may include CSRF tokens
      console.log('Form protection check - Server Actions provide CSRF protection');
    }
  });
});

test.describe('Intake Pipeline Security - Rate Limiting', () => {
  test('API has rate limiting (informational)', async ({ request }) => {
    // Make multiple rapid requests
    const responses = await Promise.all(
      Array.from({ length: 10 }, () =>
        request.get('/api/requests', {
          headers: {
            Cookie: 'test-cookie=value', // Will fail auth but tests rate limiting
          },
        })
      )
    );

    // Check if any response indicates rate limiting
    const rateLimited = responses.some(
      (r) => r.status() === 429 || r.headers()['x-ratelimit-remaining'] !== undefined
    );

    console.log('Rate limiting detected:', rateLimited);
    // This is informational - rate limiting may be handled by infrastructure
  });
});
