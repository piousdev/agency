# Change: Fix Testing Infrastructure and Production Readiness

## Why

During initial codebase audit, several critical gaps were identified that prevent proper testing and production deployment:

- Playwright E2E tests are incorrectly configured to run with Vitest, causing test failures
- API integration tests fail due to missing SMTP mock configuration
- No health check endpoints for monitoring and deployment validation
- Environment variable documentation is incomplete

## What Changes

- Separate Playwright test configuration from Vitest unit tests
- Add SMTP mocking for API integration tests
- Implement health check endpoints for API and Web applications
- Document all required environment variables in .env.example files

## Impact

- **Affected specs**: `testing`, `api-health-check` (new capability)
- **Affected code**:
  - `apps/web/vitest.config.ts` - Exclude Playwright tests
  - `apps/api/src/test/setup.ts` - Add SMTP mock
  - `apps/api/src/routes/health.ts` - New health check route
  - `apps/web/src/app/api/health/route.ts` - New health check API route
  - `.env.example` files - Complete documentation
