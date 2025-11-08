# Change: Add Project Infrastructure & Monorepo Setup

## Why

The Skyll Platform requires a solid foundation to support scalable development of client management, project tracking, and service delivery features. We need to establish the core infrastructure before implementing authentication and business logic.

This proposal sets up:

- Modern tech stack with Next.js 16 (React 19) and Hono API
- Turborepo monorepo for managing multiple apps and shared packages
- Database infrastructure with Neon Postgres and Drizzle ORM
- Development tooling for type safety, linting, and testing
- Deployment configuration for Fly.io hosting

**Why now**: This is the foundational setup that all other features depend on. Must be done before implementing authentication or any business features.

**Why this matters**:

- Next.js 16 includes Turbopack (stable), React 19.2 support, and async request APIs
- Proper monorepo structure prevents code duplication and enables shared packages
- Drizzle ORM with Neon provides type-safe database access at scale (1M+ users target)

## What Changes

- Initialize Turborepo monorepo with pnpm workspaces
- Set up `apps/web` with Next.js 16 + React 19 + App Router
- Set up `apps/api` with Hono framework for backend
- Create `packages/tsconfig` for shared TypeScript configuration
- Configure Drizzle ORM with Neon Postgres connection
- Set up development tooling (ESLint, Prettier, TypeScript)
- Configure deployment for Fly.io
- Add environment variable management
- Set up basic testing infrastructure (Vitest, Playwright)

## Impact

- **Affected specs**: `infrastructure` (new capability)
- **Affected code**:
  - `apps/web/` - Next.js 16 frontend application
  - `apps/api/` - Hono backend API
  - `packages/tsconfig/` - Shared TypeScript configs
  - `turbo.json` - Turborepo pipeline configuration
  - `pnpm-workspace.yaml` - Workspace package configuration
  - `drizzle.config.ts` - Database ORM configuration
- **Dependencies**:
  - Next.js 16 (requires React 19.2+, TypeScript 5.1+)
  - Hono (lightweight web framework)
  - Turborepo v2.5.6+ with pnpm v9.0.0
  - Drizzle ORM + Neon serverless driver
  - Vitest, Playwright for testing
- **Deployment**: Fly.io configuration for both web and API apps
