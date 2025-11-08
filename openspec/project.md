# Project Context

## Purpose

**Skyll Platform** is the internal operations system for Skyll, a creative agency providing creative services, web development, and software development globally.

This is **NOT** a multi-tenant SaaS product - it's Skyll's core business application for:

- Managing client relationships and projects
- Tracking project status and deliverables
- Handling service requests (intakes, bugs, support tickets)
- Client communication and file sharing
- Subscription management and billing
- Content delivery to clients

**Key Architecture Principle**: Client projects (websites, apps) are built in isolated repositories. This platform only references those projects by name and ID, allowing clients to manage requests and view status.

**Scale Target**: 1M+ users globally across Africa, Europe, Americas, and Asia

## Tech Stack

- **Frontend**: Next.js 16.0.1, React 19.0.0, TypeScript 5.1+
- **UI**: shadcn/ui, Tailwind CSS v4.1.17, Radix UI
- **State Management**: Zustand, TanStack Query + Hono RPC
- **Forms**: React Hook Form, Zod v4.1.12 + @hono/zod-validator
- **Backend API**: Hono v4.0.0
- **Database**: Neon Postgres 17.5, Drizzle ORM v0.44.7
- **Authentication**: BetterAuth v1.x ✅ (Base setup complete)
- **Real-time**: Cloudflare Durable Objects (planned)
- **Background Jobs**: Upstash QStash (planned)
- **File Storage**: Cloudflare R2 + CDN (planned)
- **Email**: Resend (planned)
- **Payments**: Polar (planned)
- **Monitoring**: Sentry, PostHog (planned)
- **Testing**: Vitest, Playwright, k6 (planned)
- **Hosting**: Fly.io (planned)
- **PWA**: next-pwa (planned)
- **Package Manager**: pnpm v9.0.0
- **Monorepo**: Turborepo v2.6.0 with pnpm workspaces

### Workspace Structure

- `apps/api` - Hono backend API
- `apps/web` - Next.js frontend (client portal + admin)
- `packages/tsconfig` - Shared TypeScript configuration

## Project Conventions

### Code Style

- **TypeScript**: Strict mode enabled, TypeScript 5 features
- **File Naming**: kebab-case (e.g., `user-service.ts`, `project-status.tsx`)
- **Component Naming**: PascalCase for components (e.g., `ProjectDashboard.tsx`)
- **Function/Variable Naming**: camelCase (e.g., `getUserProjects`, `clientData`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_CREDITS_PER_MONTH`)
- **Formatting**: Run `pnpm format` before committing
- **Linting**: Run `pnpm lint` to catch issues
- **Type Safety**: Prefer Zod schemas for runtime validation, TypeScript types for compile-time

### Architecture Patterns

- **Monorepo Architecture**: Turborepo manages apps and shared packages
- **API Design**: Hono RPC with type-safe client/server communication
- **Data Fetching**: TanStack Query for server state, Zustand for client state
- **Form Validation**: Zod schemas shared between client and server via @hono/zod-validator
- **Real-time**: Cloudflare Durable Objects for live features (chat, notifications)
- **Background Processing**: QStash for async jobs (email sending, invoice generation)
- **File Handling**: R2 for storage, CDN for delivery, scoped access by client/project
- **Spec-Driven Development**: OpenSpec for change proposals and capability specs
- **Database Access**: Drizzle ORM with type-safe queries, migrations tracked in version control
- **Error Handling**: Structured errors with Sentry integration for monitoring

### Environment Variable Management

**Philosophy**: Package-level isolation following Turborepo 2025 best practices.

**Structure**:

- ⛔ **NO root-level .env files** - Each app manages its own environment
- ✅ **Package-level .env files**: `apps/web/.env`, `apps/api/.env`
- ✅ **Example files tracked in git**: `.env.example` files document required variables
- ✅ **Actual .env files git-ignored**: Secrets never committed

**Configuration**:

- **Strict Mode (Enabled)**: All environment variables must be declared in `turbo.json`
- **Global Variables** (`globalEnv`): `NODE_ENV` - used across all tasks
- **Global PassThrough** (`globalPassThroughEnv`): `PORT` - runtime-only, no cache impact
- **Task-Specific Variables**: Declared in `env` array for each task in turbo.json
- **Framework Inference**: Turborepo automatically includes `NEXT_PUBLIC_*`, `VITE_*` prefixes

**Loading Strategy**:

- **Next.js apps**: Use `NEXT_PUBLIC_*` prefix for client-side variables
- **Hono API**: Load via `import 'dotenv/config'` at entry point (src/index.ts:1)
- **Database config**: Environment loaded before db connection initialized
- **Runtime mutation prohibited**: Variables must be set before task execution

**Validation**:

- **ESLint**: `eslint-config-turbo` validates undeclared environment variable usage
- **Build-time checks**: CI/CD validates required variables are present
- **Type safety**: Consider using Zod schemas for environment variable validation

**Security**:

- Use `.env.local` (git-ignored) for local development secrets
- Rotate secrets regularly (document in .env.example when rotation needed)
- Platform variables (Vercel/Fly.io) validated against turbo.json declarations
- Never log environment variable values in production

**Development Workflow**:

1. Copy `.env.example` to `.env` in relevant app directory
2. Fill in actual values for local development
3. When adding new env var:
   - Add to app's `.env.example` with description
   - Add to `turbo.json` in appropriate task's `env` array
   - Document in app's README if needed
4. Run `pnpm lint` to validate env var usage

### Testing Strategy

- **Unit Tests**: Vitest for business logic, utilities, and API handlers
- **Integration Tests**: Test API endpoints with database interactions
- **E2E Tests**: Playwright for critical user flows (client onboarding, ticket submission, payments)
- **Performance Tests**: k6 for load testing (target: 1M+ users)
- **Test Coverage**: Aim for >80% coverage on critical paths
- **Run Tests**: `pnpm test` (orchestrated by Turborepo)
- **Requirement**: Tests must accompany spec requirements before marking tasks complete

### Git Workflow

- **Main Branch**: `main` (production-ready code)
- **Branching Strategy**: Feature branches from main (e.g., `add-credit-system`, `fix-invoice-download`)
- **OpenSpec Integration**:
  1. Create and validate proposal before starting work
  2. Get approval on proposal
  3. Create implementation branch referencing proposal
  4. Submit PR with completed work
  5. After deployment, create separate archive PR
- **Commit Messages**: Clear, descriptive messages explaining "why" not just "what"
- **Change IDs**: Verb-led kebab-case (e.g., `add-subscription-tiers`, `update-client-permissions`)

## Domain Context

### Business Model

Skyll is a creative agency offering:

- **Creative Services**: Branding, content creation, digital media
- **Web Development**: Websites, web applications
- **Software Development**: Mobile apps, custom software

### Client Entry Point

Clients enter the system **AFTER** contract signing. Admin creates client account and links them to project(s).

### Client Types

**Type A: Creative Services**

- Products: Branding, content, design
- Can: Submit creative briefs, review deliverables, view invoices
- Cannot: Submit bug reports, request maintenance

**Type B: Software Services**

- Products: Web apps, mobile apps, websites
- Can: Submit intakes, bug reports, change requests, access maintenance (with subscription)
- Cannot: Submit creative briefs (unless also Type C)

**Type C: Full Service**

- Products: Creative + Software
- Can: Everything from Type A + Type B
- May have multiple linked projects

**One-Time Project Clients**

- Limited-duration access
- Can view status and deliverables during project
- No subscription access
- Account may expire after delivery + feedback period

### Subscription & Credit System

**Subscription Tiers**:

- **Starter**: 10 tickets/month, 48hr response, 20 credits/month, email support
- **Professional**: 30 tickets/month, 24hr response, 50 credits/month, priority support, 1 emergency/month
- **Scale**: Unlimited tickets, 4hr response, 150 credits/month, premium SLA, dedicated account manager

**Credit Costs** (examples):

- Bug fix (small): 5 credits | (medium): 10 | (critical): 20
- Feature request (small): 25 | (medium): 50 | (large): 100
- UI/UX change (minor): 15 | (major): 40
- Content update: 5 credits

**Credit Rules**:

- Roll over for 3 months, then expire
- Can purchase additional packs
- Per-project allocation (separate for each project)
- Support tickets (free) vs Credit requests (paid work)

### Team Roles

**Creative Team**: Creative Director, Designers, Content Creators
**Technical Team**: Engineering Lead, Developers, DevOps Engineer
**Operations Team**: Admin (full access), Project Manager, Account Manager, Admin Staff

### Multi-User & Multi-Project

- One company can have multiple users (e.g., CEO, CTO, Marketing Director)
- One user can have multiple projects (e.g., mobile app + website)
- Company admin can manage organization users
- Clients only see their own projects and data

## Important Constraints

- **Scale Requirement**: Must support 1M+ users globally
- **Data Isolation**: Clients can only access their own projects and data
- **Project Separation**: Actual projects are built externally, only referenced here by ID/name
- **Approval Gate**: No implementation without OpenSpec proposal approval
- **Validation Required**: All proposals must pass `openspec validate --strict`
- **Real-time Features**: Notifications, live chat, and status updates must be instant
- **File Size Limits**: Large deliverables (codebases, videos, design sources) delivered externally
- **Credit Expiration**: Enforce 3-month rollover rule
- **SLA Compliance**: Response times must match subscription tier commitments
- **Simplicity First**: Default to <100 lines of new code, avoid over-engineering

## External Dependencies

- **Database**: Neon (managed Postgres)
- **Authentication**: BetterAuth (session management, user auth)
- **Real-time**: Cloudflare Durable Objects (WebSocket connections, live features)
- **Background Jobs**: Upstash QStash (async email, invoice generation, notifications)
- **File Storage**: Cloudflare R2 + CDN (deliverables, invoices, images)
- **Email Service**: Resend (transactional emails, notifications)
- **Payment Processing**: Polar (invoices, subscription billing)
- **Monitoring**: Sentry (error tracking), PostHog (analytics, feature flags)
- **Hosting**: Fly.io (application deployment)
- **CDN**: Cloudflare (asset delivery, DDoS protection)
