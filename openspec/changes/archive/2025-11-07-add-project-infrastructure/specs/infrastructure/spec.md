# Infrastructure Capability

## ADDED Requirements

### Requirement: Monorepo Structure

The system SHALL use Turborepo with pnpm workspaces to manage multiple
applications and shared packages in a single repository.

#### Scenario: Install dependencies across monorepo

- **WHEN** a developer runs `pnpm install` in the root directory
- **THEN** all dependencies for apps/web, apps/api, and packages/\* SHALL be
  installed
- **AND** pnpm SHALL create symlinks for workspace dependencies
- **AND** a single pnpm-lock.yaml file SHALL be created at the root

#### Scenario: Run development servers in parallel

- **WHEN** a developer runs `pnpm dev` from the root
- **THEN** Turborepo SHALL start dev servers for both apps/web and apps/api
  concurrently
- **AND** the Next.js app SHALL be accessible at http://localhost:3000
- **AND** the Hono API SHALL be accessible at http://localhost:8000

#### Scenario: Build all apps in correct order

- **WHEN** a developer runs `pnpm build` from the root
- **THEN** Turborepo SHALL build packages before apps (dependency order)
- **AND** apps/web SHALL compile successfully with Next.js 16
- **AND** apps/api SHALL compile successfully with TypeScript
- **AND** build artifacts SHALL be cached for subsequent builds

### Requirement: Next.js 16 Frontend Application

The system SHALL provide a Next.js 16 application with React 19.2, TypeScript,
and Tailwind CSS using the App Router architecture.

#### Scenario: Next.js app starts successfully

- **WHEN** a developer runs `pnpm dev` in apps/web
- **THEN** Next.js SHALL start with Turbopack in development mode
- **AND** the application SHALL be accessible at http://localhost:3000
- **AND** hot module replacement SHALL work for code changes

#### Scenario: Next.js production build

- **WHEN** a developer runs `pnpm build` in apps/web
- **THEN** Next.js SHALL compile all pages and components
- **AND** static assets SHALL be optimized (images, fonts, CSS)
- **AND** the .next/ output directory SHALL contain production-ready files
- **AND** TypeScript type checking SHALL pass with no errors

#### Scenario: Server and Client Components work correctly

- **WHEN** a page uses Server Components (default in App Router)
- **THEN** the component SHALL render on the server
- **AND** only the required JavaScript SHALL be sent to the client
- **WHEN** a component uses 'use client' directive
- **THEN** it SHALL be hydrated on the client with interactivity

#### Scenario: Tailwind CSS styling works

- **WHEN** a component uses Tailwind utility classes
- **THEN** the styles SHALL be applied correctly
- **AND** the final CSS bundle SHALL include only used classes (JIT mode)

### Requirement: Hono Backend API

The system SHALL provide a Hono-based API with TypeScript, Zod validation, and
Hono RPC for type-safe communication.

#### Scenario: Hono API starts successfully

- **WHEN** a developer runs `pnpm dev` in apps/api
- **THEN** the Hono server SHALL start on http://localhost:8000
- **AND** the health check endpoint (/health) SHALL return 200 OK
- **AND** hot reload SHALL work when source files change

#### Scenario: API endpoint with Zod validation

- **WHEN** a request is made to an endpoint with @hono/zod-validator
- **AND** the request body matches the Zod schema
- **THEN** the endpoint handler SHALL execute successfully
- **WHEN** the request body fails validation
- **THEN** the API SHALL return a 400 Bad Request with validation errors

#### Scenario: Hono RPC type safety

- **WHEN** the frontend imports the Hono RPC client
- **THEN** all API routes SHALL be type-checked at compile time
- **AND** request/response types SHALL be inferred automatically
- **AND** TypeScript SHALL show errors for invalid API calls

### Requirement: TypeScript Configuration

The system SHALL use shared TypeScript configurations with strict mode enabled
across all apps and packages.

#### Scenario: Shared TypeScript config inheritance

- **WHEN** apps/web extends @repo/typescript-config/nextjs.json
- **THEN** it SHALL inherit all base TypeScript settings
- **AND** strict mode SHALL be enabled (strict: true)
- **AND** Next.js-specific settings SHALL be applied

#### Scenario: Type checking across monorepo

- **WHEN** a developer runs type checking
- **THEN** all TypeScript errors SHALL be caught at compile time
- **AND** shared types from packages SHALL be correctly resolved
- **AND** workspace protocol dependencies SHALL have proper type definitions

### Requirement: Database Connection with Drizzle ORM

The system SHALL connect to Neon Postgres using Drizzle ORM with type-safe
schema definitions and migrations.

#### Scenario: Database connection established

- **WHEN** the API starts and DATABASE_URL is set
- **THEN** Drizzle SHALL create a connection to Neon Postgres
- **AND** the connection SHALL be validated with a test query
- **AND** connection errors SHALL be logged to Sentry

#### Scenario: Drizzle schema generation

- **WHEN** a developer runs `pnpm db:generate`
- **THEN** Drizzle Kit SHALL generate migration files from schema definitions
- **AND** migrations SHALL be saved to the drizzle/ directory
- **AND** SQL statements SHALL be PostgreSQL-compatible

#### Scenario: Apply database migrations

- **WHEN** a developer runs `pnpm db:migrate`
- **THEN** Drizzle Kit SHALL apply pending migrations to the database
- **AND** the migrations SHALL be idempotent (safe to run multiple times)
- **AND** migration status SHALL be tracked in the database

#### Scenario: Drizzle Studio access

- **WHEN** a developer runs `pnpm db:studio`
- **THEN** Drizzle Studio SHALL open a web UI for browsing the database
- **AND** tables, rows, and relationships SHALL be visible
- **AND** developers can inspect and edit data in development

### Requirement: Environment Variable Management

The system SHALL manage environment variables securely with validation and type
safety for both development and production.

#### Scenario: Load development environment variables

- **WHEN** the application starts in development mode
- **THEN** variables SHALL be loaded from .env.local
- **AND** NEXT*PUBLIC*\* variables SHALL be available in the browser
- **AND** server-only variables SHALL NOT be exposed to the client

#### Scenario: Environment variable validation

- **WHEN** a required environment variable is missing
- **THEN** the application SHALL fail to start with a clear error message
- **AND** the error SHALL indicate which variable is missing

#### Scenario: Type-safe environment variables

- **WHEN** code accesses process.env variables
- **THEN** TypeScript SHALL enforce type safety
- **AND** autocomplete SHALL work for defined variables

### Requirement: Code Quality Tooling

The system SHALL enforce code quality through ESLint, Prettier, and automated
checks.

#### Scenario: ESLint catches errors

- **WHEN** a developer runs `pnpm lint`
- **THEN** ESLint SHALL check all TypeScript and TSX files
- **AND** Next.js-specific rules SHALL be applied to apps/web
- **AND** Node.js-specific rules SHALL be applied to apps/api
- **AND** errors SHALL be reported with file locations

#### Scenario: Prettier formats code consistently

- **WHEN** a developer runs `pnpm format`
- **THEN** Prettier SHALL format all source files
- **AND** formatting SHALL be consistent across the entire monorepo
- **AND** no conflicts with ESLint rules SHALL occur

#### Scenario: Pre-commit hooks enforce quality

- **WHEN** a developer commits code with Husky configured
- **THEN** ESLint SHALL run on staged files
- **AND** the commit SHALL be blocked if linting fails
- **AND** formatting checks SHALL pass

### Requirement: Testing Infrastructure

The system SHALL support unit, integration, and end-to-end testing with Vitest
and Playwright.

#### Scenario: Run unit tests with Vitest

- **WHEN** a developer runs `pnpm test`
- **THEN** Vitest SHALL execute all test files matching \*.test.ts pattern
- **AND** tests SHALL run in watch mode during development
- **AND** coverage reports SHALL be generated

#### Scenario: Run E2E tests with Playwright

- **WHEN** a developer runs Playwright tests
- **THEN** tests SHALL run in headless browsers (Chrome, Firefox, Safari)
- **AND** the Next.js dev server SHALL start automatically
- **AND** test results SHALL include screenshots on failure

#### Scenario: Parallel test execution

- **WHEN** tests run in CI environment
- **THEN** Turborepo SHALL run tests in parallel across packages
- **AND** test results SHALL be cached
- **AND** only affected tests SHALL re-run on subsequent runs

### Requirement: Deployment Configuration

The system SHALL support deployment to Fly.io for both web and API applications
with proper configuration and environment management.

#### Scenario: API deploys to Fly.io

- **WHEN** the API is deployed using `fly deploy` in apps/api
- **THEN** Fly.io SHALL build the Docker image
- **AND** the application SHALL start successfully
- **AND** health checks SHALL pass
- **AND** environment variables SHALL be loaded from Fly secrets

#### Scenario: Web app deploys to Fly.io

- **WHEN** the Next.js app is deployed using `fly deploy` in apps/web
- **THEN** Fly.io SHALL build the Next.js application
- **AND** the production server SHALL start
- **AND** static assets SHALL be served correctly
- **AND** environment variables SHALL be available

#### Scenario: Zero-downtime deployments

- **WHEN** a new version is deployed
- **THEN** Fly.io SHALL perform a rolling update
- **AND** old instances SHALL remain until new ones are healthy
- **AND** no requests SHALL be dropped during deployment

### Requirement: Development Experience

The system SHALL provide a fast, productive development experience with hot
reload, type safety, and clear error messages.

#### Scenario: Fast hot reload in development

- **WHEN** a developer changes a source file
- **THEN** changes SHALL be reflected in the browser within 500ms
- **AND** component state SHALL be preserved where possible (Fast Refresh)
- **AND** the terminal SHALL show compilation status

#### Scenario: Clear error messages

- **WHEN** a TypeScript error occurs
- **THEN** the error message SHALL include the file path and line number
- **AND** the error SHALL be displayed in both terminal and browser
- **AND** the error SHALL include suggestions for fixes when available

#### Scenario: Development server reliability

- **WHEN** both dev servers are running
- **THEN** they SHALL not crash under normal development workload
- **AND** port conflicts SHALL be detected and reported
- **AND** memory usage SHALL remain stable during development

### Requirement: Build Performance

The system SHALL build and deploy efficiently with caching and parallel
execution to support rapid iteration.

#### Scenario: Incremental builds with Turbopack

- **WHEN** a file is changed and the build re-runs
- **THEN** only affected modules SHALL be rebuilt
- **AND** build time SHALL be under 2 seconds for single-file changes
- **AND** Turbopack cache SHALL be utilized

#### Scenario: Turborepo cache optimization

- **WHEN** `pnpm build` runs after a previous build with no changes
- **THEN** Turborepo SHALL use cached build outputs
- **AND** the build SHALL complete in under 1 second
- **AND** cache status SHALL be logged (FULL TURBO achieved)

#### Scenario: Parallel builds in CI

- **WHEN** CI runs the build pipeline
- **THEN** independent packages SHALL build in parallel
- **AND** total build time SHALL be minimized
- **AND** remote caching SHALL work (if configured)
