# Implementation Tasks

## 1. Fix Test Configuration

- [x] 1.1 Update Vitest config to exclude Playwright test files
- [x] 1.2 Add SMTP mock to API test setup
- [x] 1.3 Verify unit tests pass independently
- [x] 1.4 Verify Playwright tests run with `pnpm test:e2e`

## 2. Add Health Check Endpoints

- [x] 2.1 Implement `/health` endpoint in API (Hono)
- [x] 2.2 Implement `/api/health` endpoint in Web (Next.js)
- [x] 2.3 Add database connectivity check to API health endpoint
- [x] 2.4 Add unit tests for health check endpoints

## 3. Documentation

- [x] 3.1 Document all environment variables in root .env.example
- [x] 3.2 Document environment variables in apps/api/.env.example
- [x] 3.3 Document environment variables in apps/web/.env.example
- [x] 3.4 Add comments explaining purpose of each variable
