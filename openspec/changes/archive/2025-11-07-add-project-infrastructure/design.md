# Design: Project Infrastructure & Monorepo Setup

## Context

The Skyll Platform needs a scalable, type-safe, and developer-friendly infrastructure that can support:

- 1M+ users globally (high scale requirement)
- Multiple client types and team roles with complex permissions
- Real-time features (chat, notifications, live updates)
- Subscription billing and credit management
- File uploads and delivery

**Constraints**:

- Must use modern, actively maintained technologies
- Must support TypeScript throughout the stack
- Must integrate with Cloudflare (R2, Durable Objects), Upstash (QStash), and other services
- Must deploy on Fly.io
- Must be monorepo-compatible for code sharing

**Stakeholders**:

- Development team (needs good DX, fast build times)
- Users (need fast page loads, reliable API)
- Business (needs scalability and cost efficiency)

## Goals / Non-Goals

**Goals**:

- Establish type-safe full-stack development environment
- Enable code sharing between web and API (types, validation schemas, utils)
- Fast development iteration with hot reload
- Production-ready build pipeline
- Scalable to 1M+ users
- Easy deployment and rollbacks

**Non-Goals**:

- Microservices architecture - monolithic API is sufficient for MVP
- Container orchestration (Kubernetes) - Fly.io handles this
- Multi-region deployment initially - can add later
- Advanced monitoring/observability beyond Sentry/PostHog - add as needed

## Decisions

### Decision 1: Next.js 16 with App Router

**What**: Use Next.js 16 (latest, released in 2025) with App Router and React 19.2

**Why**:

- **Turbopack is now stable and default** - significantly faster builds than Webpack
- **React 19.2** includes latest features: useActionState, useFormStatus, useOptimistic
- **App Router maturity** - server components, parallel routes, intercepting routes fully supported
- **Async Request APIs** - cookies(), headers(), params are now async (better for edge runtime)
- **Built-in optimizations** - automatic image optimization, font optimization, code splitting

**Key Features for Skyll Platform**:

- Server Components reduce JavaScript bundle size (critical for 1M+ users)
- Parallel routes for complex dashboard layouts
- Route handlers for API endpoints (alternative to separate API if needed)
- Built-in caching strategies (can leverage for project data)

**Alternatives Considered**:

- **Remix** - Good SSR story, but smaller ecosystem than Next.js, less tooling
- **SvelteKit** - Excellent performance, but team expertise and hiring favor React
- **Vite + React SPA** - Simpler but loses SSR benefits, worse initial load times

### Decision 2: Hono for Backend API

**What**: Use Hono as the backend framework

**Why**:

- **Ultrafast** - Built on Web Standards, minimal overhead (14kB with zero dependencies for tiny preset)
- **Edge-first** - Works seamlessly with Cloudflare Workers (we use Durable Objects)
- **TypeScript-first** - Excellent type inference, Hono RPC for end-to-end type safety
- **Middleware ecosystem** - Built-in middleware for common tasks (auth, CORS, rate limiting)
- **Runtime agnostic** - Works on Node.js, Bun, Deno, Edge (Fly.io compatibility)

**Hono RPC Integration**:

- Type-safe client/server communication (no manual API typing)
- Zod integration via @hono/zod-validator for runtime validation
- TanStack Query works perfectly with Hono RPC

**Alternatives Considered**:

- **Express** - Too slow, not TypeScript-first, larger bundle
- **Fastify** - Good performance, but less edge-compatible, heavier than Hono
- **tRPC** - Excellent DX, but requires more boilerplate, Hono RPC is simpler
- **Next.js API Routes only** - Couples frontend and backend too tightly, harder to scale independently

### Decision 3: Turborepo for Monorepo Management

**What**: Use Turborepo v2.5.6+ with pnpm workspaces

**Why**:

- **Task orchestration** - Runs tasks in parallel across packages with dependency awareness
- **Caching** - Remote and local caching dramatically speeds up CI/CD
- **Simple configuration** - turbo.json is intuitive, minimal setup
- **pnpm integration** - Efficient disk usage, fast installs, workspace protocol support

**Monorepo Structure**:

```
apps/
  web/          # Next.js frontend
  api/          # Hono backend
packages/
  tsconfig/     # Shared TypeScript configs
```

**Pipeline Configuration**:

- `build`: Runs in topological order (dependencies build first)
- `dev`: Parallel, no cache (persistent dev servers)
- `lint`: Parallel across all packages
- `test`: Parallel with coverage caching

**Why not nx or Lerna**:

- **nx** - More powerful but heavier, overkill for 2-app monorepo
- **Lerna** - Outdated, Turborepo has better DX and performance

### Decision 4: Drizzle ORM with Neon Postgres

**What**: Use Drizzle ORM for database access, Neon for managed Postgres

**Why Drizzle**:

- **TypeScript-first** - Schema defined in TypeScript, types auto-generated
- **Lightweight** - No heavy runtime overhead like Prisma
- **SQL-like API** - Easy to write complex queries, not abstracted away from SQL
- **Migrations** - drizzle-kit handles schema changes cleanly
- **Better performance** - Faster query execution than Prisma

**Why Neon**:

- **Serverless Postgres** - Auto-scaling, pay for what you use
- **Branching** - Database branches for preview environments (perfect for Fly.io)
- **Fast cold starts** - Critical for edge deployments
- **Connection pooling** - Built-in, handles 1M+ users scale

**Connection Strategy**:

- Use `@neondatabase/serverless` with `drizzle-orm/neon-http` for synchronous queries
- HTTP-based queries work well with edge runtimes and Fly.io
- Session/transaction support when needed

**Alternatives Considered**:

- **Prisma** - Popular but slower runtime, heavier abstractions, worse edge support
- **TypeORM** - Good but outdated patterns, slower than Drizzle
- **Kysely** - Excellent SQL builder, but Drizzle has better DX for schema management
- **Supabase** - Good product, but we need Neon's branching and Fly.io compatibility

### Decision 5: TypeScript Configuration Strategy

**What**: Shared TypeScript configs in `packages/tsconfig`

**Why**:

- **Consistency** - Same compiler options across apps
- **Extensibility** - Apps extend base config, add app-specific settings
- **Maintenance** - Update once, all apps benefit

**Configs**:

- `base.json` - Shared strict settings (strict: true, noUncheckedIndexedAccess, etc.)
- `nextjs.json` - Extends base, adds Next.js-specific settings (jsx: "preserve", etc.)
- `node.json` - Extends base, adds Node.js settings (module: "ESNext", moduleResolution: "bundler")

**TypeScript 5.1+ Required**:

- Next.js 16 requires TS 5.1.0 minimum
- Better type inference for async functions
- Performance improvements in type checking

### Decision 6: Development Tooling Stack

**What**: ESLint, Prettier, Vitest, Playwright

**Why ESLint**:

- Standard for React/Next.js projects
- Next.js has built-in ESLint config
- Can extend with custom rules for consistency

**Why Prettier**:

- Opinionated formatting (less debate)
- Integrates with ESLint
- Fast, reliable

**Why Vitest**:

- **Fast** - Vite-powered, instant re-runs
- **Jest-compatible API** - Easy migration, familiar syntax
- **ESM-first** - Better for modern TypeScript projects
- **UI mode** - Great debugging experience

**Why Playwright**:

- **Cross-browser testing** - Chrome, Firefox, Safari
- **Reliable** - Auto-waiting, better than Selenium
- **Modern API** - Async/await, TypeScript support
- **Debugging tools** - Trace viewer, inspector

**Alternatives Considered**:

- **Jest** - Slower than Vitest, not ESM-first
- **Cypress** - Good E2E, but Playwright is faster and more reliable
- **Testing Library only** - Need full E2E coverage, not just component tests

## Risks / Trade-offs

### Risk 1: Next.js 16 is New

**Risk**: Next.js 16 just released, may have bugs or breaking changes

**Mitigation**:

- Next.js 16 is stable (not RC)
- Large community, fast bug fixes
- Upgrade path is well-documented (codemod available)
- Turbopack is now stable (no longer beta)
- React 19.2 is also stable

### Risk 2: Hono is Less Known

**Risk**: Smaller community than Express, fewer Stack Overflow answers

**Mitigation**:

- Excellent documentation at hono.dev
- Growing rapidly, good GitHub activity
- Simple API (easy to debug ourselves)
- Web Standards-based (transferable knowledge)
- Active Discord community

### Risk 3: Monorepo Complexity

**Risk**: Monorepos can be hard to manage (dependency hell, slow CI)

**Mitigation**:

- Turborepo caching makes CI fast
- pnpm handles dependencies efficiently
- Keep monorepo small (2 apps, minimal shared packages for now)
- Can split later if needed (but unlikely for this scale)

### Risk 4: Database Connection Limits

**Risk**: 1M+ users could hit connection limits

**Mitigation**:

- Neon has built-in connection pooling
- HTTP-based queries (neon-http) don't hold connections
- Can add Supabase Pooler if needed
- Fly.io can scale horizontally (more instances)

## Migration Plan

**Phase 1: Core Setup (Week 1)**

1. Initialize Turborepo + pnpm workspaces
2. Set up shared tsconfig package
3. Create basic Next.js 16 app (hello world)
4. Create basic Hono API (health check)
5. Configure Drizzle + Neon connection
6. Verify builds and dev mode work

**Phase 2: Tooling (Week 1-2)** 7. Set up ESLint + Prettier 8. Configure Vitest for both apps 9. Set up Playwright for E2E tests 10. Add basic smoke tests

**Phase 3: Deployment (Week 2)** 11. Configure Fly.io for API 12. Configure Fly.io for Web app 13. Set up CI/CD (GitHub Actions) 14. Deploy to staging, verify

**Phase 4: Developer Experience (Week 2)** 15. Write comprehensive README 16. Document development workflow 17. Set up VS Code recommended extensions 18. Create contribution guidelines

**Rollback Plan**:

- All changes are additive (not modifying existing code)
- Can revert via git if issues arise
- No database migrations yet (safe to reset)

## Open Questions

1. **Should we use Bun instead of Node.js for the API?**
   - Leaning No - Fly.io Node.js support is more mature
   - Bun is faster but less production-proven
   - Can revisit once Bun 2.0 stabilizes

2. **Do we need a separate package for shared types/schemas?**
   - Start without it - Hono RPC handles type sharing
   - If we add mobile app later, create `packages/shared`

3. **Should we use next-pwa from the start?**
   - Yes - Configured but not enforced (progressive enhancement)
   - Offline support is nice-to-have, not critical for MVP

4. **Monorepo vs separate repos for web and API?**
   - Sticking with monorepo - benefits outweigh complexity
   - Code sharing (Zod schemas, types) is critical
   - Deployment can still be independent
