# Skyll Platform

A modern, full-stack agency management platform built with Next.js 16, React 19, Hono, and Neon Postgres. Designed for managing clients, projects, and service requests with role-based access control and invitation-based onboarding.

## 🎯 Overview

The Skyll Platform is a monorepo application that provides:

- **Client Management** - Track multiple client types (A, B, C, one-time)
- **Project Tracking** - Manage projects and deliverables
- **Service Requests** - Handle client service requests
- **Role-Based Access** - Granular permissions for internal team and external clients
- **Invitation System** - Secure client onboarding via email invitations
- **Authentication** - Email/password auth powered by BetterAuth

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Browser (Client)                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Next.js 16 App (Web)                       │
│  - React 19 + Tailwind CSS v4                           │
│  - Zustand (State) + TanStack Query (Data)              │
│  - React Hook Form + Zod (Forms)                        │
│  - Port: 3000                                           │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/HTTPS
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Hono API (Backend)                      │
│  - TypeScript + Zod validation                          │
│  - BetterAuth (Authentication)                          │
│  - Drizzle ORM                                          │
│  - Port: 8000                                           │
└────────────────────┬────────────────────────────────────┘
                     │ PostgreSQL
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Neon Postgres (Database)                    │
│  - PostgreSQL 17.5                                       │
│  - Serverless, auto-scaling                             │
│  - Schema: users, sessions, accounts, verifications     │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Tech Stack

### Frontend (Web)

- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Styling:** Tailwind CSS v4 with PostCSS
- **State Management:** Zustand + TanStack Query
- **Forms:** React Hook Form + Zod
- **Auth Client:** BetterAuth React

### Backend (API)

- **Framework:** Hono v4
- **Runtime:** Node.js (via @hono/node-server)
- **Validation:** Zod
- **ORM:** Drizzle ORM
- **Database:** Neon Postgres (serverless)
- **Auth:** BetterAuth

### Infrastructure

- **Monorepo:** Turborepo v2.6.0
- **Package Manager:** pnpm v9.0.0
- **Build Tool:** TypeScript v5.1.0
- **Deployment:** Fly.io (Docker containers)

### Development

- **Testing:** Vitest (unit), Playwright (E2E), k6 (load)
- **Linting:** ESLint + eslint-config-turbo
- **Formatting:** Prettier v3.6.2
- **Git Hooks:** Husky + lint-staged

## 📋 Prerequisites

- **Node.js** 18+ (LTS recommended)
- **pnpm** 9.0.0 (automatically used via Corepack)
- **Git** for version control

Optional:

- **Docker** (for containerized deployments)
- **Fly.io CLI** (for production deployments)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/agency.git
cd agency
```

### 2. Install Dependencies

```bash
pnpm install
```

This installs all dependencies for the monorepo (both apps and shared packages).

### 3. Set Up Environment Variables

Create `.env` files in both app directories:

**`apps/api/.env`:**

```bash
# Database
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-here"  # Generate: openssl rand -base64 32
BETTER_AUTH_URL="http://localhost:3000"

# Server
PORT=8000
NODE_ENV=development
```

**`apps/web/.env`:**

```bash
# API
NEXT_PUBLIC_API_URL="http://localhost:8000"

# Better Auth
BETTER_AUTH_SECRET="same-as-api-secret"
BETTER_AUTH_URL="http://localhost:3000"
```

**📝 Note:** Use `.env.example` files as templates:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

### 4. Set Up Database

1. Create a Neon Postgres database at [neon.tech](https://neon.tech)
2. Copy the connection string to `apps/api/.env`
3. Push the database schema:

```bash
cd apps/api
pnpm db:push
```

### 5. Start Development Servers

```bash
# From project root - starts both API and Web
pnpm dev
```

Or start individually:

```bash
# API only (port 8000)
pnpm --filter @repo/api dev

# Web only (port 3000)
pnpm --filter @repo/web dev
```

### 6. Verify Setup

- **API:** http://localhost:8000
- **Web:** http://localhost:3000
- **API Health Check:** http://localhost:8000/health

## 📂 Project Structure

```
agency/
├── apps/
│   ├── api/                    # Hono API server
│   │   ├── src/
│   │   │   ├── db/             # Database setup (Drizzle schemas)
│   │   │   ├── schemas/        # ✨ Zod validation schemas (centralized)
│   │   │   ├── lib/            # Shared utilities
│   │   │   ├── middleware/     # Auth, error handling
│   │   │   ├── routes/         # ✨ Modular route handlers (SOC/SRP)
│   │   │   │   ├── users/      # User management (8 files)
│   │   │   │   ├── roles/      # Role management (3 files)
│   │   │   │   └── invitations/ # Invitation system (4 files)
│   │   │   └── index.ts        # Entry point
│   │   ├── ARCHITECTURE.md     # ✨ Coding standards (250-line limit)
│   │   ├── Dockerfile          # Production container
│   │   ├── fly.toml            # Fly.io configuration
│   │   └── package.json
│   │
│   └── web/                    # Next.js web application
│       ├── src/
│       │   ├── app/            # App Router pages
│       │   ├── components/     # React components
│       │   └── lib/            # Shared utilities
│       ├── public/             # Static assets
│       ├── ARCHITECTURE.md     # Server-First architecture guide
│       ├── Dockerfile          # Production container
│       ├── fly.toml            # Fly.io configuration
│       └── package.json
│
├── packages/
│   └── typescript-config/      # Shared TypeScript configs
│       ├── base.json
│       ├── nextjs.json
│       └── node.json
│
├── openspec/                   # OpenSpec change management
│   ├── changes/                # Active change proposals
│   ├── specs/                  # Current specifications
│   └── STATUS.md               # Implementation status
│
├── tests/
│   └── performance/            # k6 load tests
│
├── turbo.json                  # Turborepo configuration
├── pnpm-workspace.yaml         # pnpm workspace config
├── DEPLOYMENT.md               # Deployment guide
├── CLAUDE.md                   # AI assistant instructions
└── package.json                # Root workspace config
```

### ✨ Architecture Highlights

**API (Hono Backend)**

- **SOC/SRP Enforced**: All files under 250 lines
- **Centralized Schemas**: Zod validation in `src/schemas/`
- **Modular Routes**: One endpoint per file, composed via `index.ts`
- See `apps/api/ARCHITECTURE.md` for full guidelines

**Web (Next.js Frontend)**

- **Server-First**: Server Components by default
- **Smart State**: Zustand for UI, TanStack Query for data
- **Type-Safe Forms**: React Hook Form + Zod
- See `apps/web/ARCHITECTURE.md` for full guidelines

## 🛠️ Development Workflow

### Available Scripts

**Root-level scripts:**

```bash
# Development
pnpm dev                 # Start both API and Web in dev mode
pnpm build               # Build all apps for production
pnpm lint                # Lint all apps
pnpm format              # Format code with Prettier
pnpm test                # Run all tests

# Deployment (requires Fly.io setup)
pnpm deploy:api          # Deploy API to Fly.io
pnpm deploy:web          # Deploy Web to Fly.io
pnpm deploy:all          # Deploy both apps

# Monitoring
pnpm fly:status          # Check status of deployed apps
pnpm fly:logs:api        # View API logs
pnpm fly:logs:web        # View Web logs
```

**API-specific scripts:**

```bash
cd apps/api

pnpm dev                 # Start dev server
pnpm build               # Compile TypeScript
pnpm start               # Run production build
pnpm test                # Run Vitest tests
pnpm test:watch          # Run tests in watch mode
pnpm test:coverage       # Generate coverage report

# Database
pnpm db:push             # Push schema changes (dev)
pnpm db:generate         # Generate migrations
pnpm db:migrate          # Run migrations (prod)
pnpm db:studio           # Open Drizzle Studio
```

**Web-specific scripts:**

```bash
cd apps/web

pnpm dev                 # Start Next.js dev server
pnpm build               # Build for production
pnpm start               # Start production server
pnpm test                # Run Vitest tests
pnpm test:e2e            # Run Playwright E2E tests
pnpm test:e2e:ui         # Run E2E tests with UI
```

### Code Quality

Pre-commit hooks automatically run:

- **ESLint** - Lint staged files
- **Prettier** - Format staged files

Manually format all files:

```bash
pnpm format
```

### Database Workflow

```bash
# 1. Update schema in apps/api/src/db/schema/
# 2. Push changes to dev database
cd apps/api
pnpm db:push

# 3. For production, generate and run migrations
pnpm db:generate
pnpm db:migrate
```

### Adding Dependencies

```bash
# Add to API
pnpm --filter @repo/api add <package>

# Add to Web
pnpm --filter @repo/web add <package>

# Add to root (dev dependency)
pnpm add -D -w <package>
```

## 🧪 Testing

### Unit Tests (Vitest)

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm --filter @repo/api test:watch
pnpm --filter @repo/web test:watch

# Generate coverage
pnpm --filter @repo/api test:coverage
```

### E2E Tests (Playwright)

```bash
cd apps/web

# Run E2E tests
pnpm test:e2e

# Run with UI
pnpm test:e2e:ui

# Debug mode
pnpm test:e2e:debug
```

### Load Tests (k6)

```bash
# Install k6 first
brew install k6  # macOS

# Run load tests
cd tests/performance
k6 run api-load-test.js
```

## 🚢 Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for complete deployment instructions.

Quick start:

```bash
# 1. Install Fly.io CLI
brew install flyctl

# 2. Login
fly auth login

# 3. Launch apps (first time)
cd apps/api && fly launch --no-deploy
cd apps/web && fly launch --no-deploy

# 4. Set secrets
fly secrets set DATABASE_URL="..." --app your-api-app
fly secrets set BETTER_AUTH_SECRET="..." --app your-api-app
fly secrets set BETTER_AUTH_SECRET="..." --app your-web-app

# 5. Deploy
pnpm deploy:all
```

## 📚 Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide
- **[openspec/STATUS.md](./openspec/STATUS.md)** - Current implementation status
- **[apps/api/README.md](./apps/api/README.md)** - API documentation
- **[apps/web/README.md](./apps/web/README.md)** - Web app documentation
- **[CLAUDE.md](./CLAUDE.md)** - AI assistant instructions

## 🔐 Environment Variables

### Required Variables

**API:**

- `DATABASE_URL` - Neon Postgres connection string
- `BETTER_AUTH_SECRET` - Auth secret key (generate with `openssl rand -base64 32`)
- `BETTER_AUTH_URL` - Web app URL (e.g., `http://localhost:3000`)
- `PORT` - Server port (default: 8000)
- `NODE_ENV` - Environment (`development` | `production`)

**Web:**

- `NEXT_PUBLIC_API_URL` - API base URL (e.g., `http://localhost:8000`)
- `BETTER_AUTH_SECRET` - Same as API secret
- `BETTER_AUTH_URL` - Web app URL (e.g., `http://localhost:3000`)

### Security Notes

- ⚠️ Never commit `.env` files to Git
- ✅ Use `.env.example` as templates
- ✅ Use `fly secrets set` for production
- ✅ Rotate secrets regularly

## 🤝 Contributing

### Branching Strategy

- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - New features
- `fix/*` - Bug fixes

### Commit Conventions

Follow conventional commits:

```
feat: add user invitation system
fix: resolve CORS issue in auth handler
docs: update deployment guide
chore: upgrade dependencies
```

### Pull Request Process

1. Create feature branch from `develop`
2. Make changes and add tests
3. Run `pnpm format` and `pnpm lint`
4. Push and create PR
5. Wait for CI checks to pass
6. Request review
7. Merge to `develop`

### Code Style

- Use TypeScript for all new code
- Follow existing patterns and conventions
- Write tests for new features
- Document complex logic

## 🐛 Troubleshooting

### Common Issues

**1. Port already in use**

```bash
# Kill process on port 8000 or 3000
lsof -ti:8000 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

**2. Database connection errors**

- Verify `DATABASE_URL` is correct
- Check Neon database is running
- Ensure `?sslmode=require` is in connection string

**3. Authentication not working**

- Ensure `BETTER_AUTH_SECRET` is the same in both apps
- Verify `BETTER_AUTH_URL` matches your web app URL
- Check CORS is configured correctly in API

**4. Build failures**

- Clear caches: `pnpm clean` (if script exists) or delete `node_modules` and reinstall
- Verify TypeScript version: `pnpm list typescript`
- Check for conflicting dependencies

**5. TypeScript errors**

- Run `pnpm build` to see all errors
- Check tsconfig.json extends correct base config
- Verify type definitions are installed

### Getting Help

1. Check existing documentation
2. Search closed issues on GitHub
3. Ask in team Slack/Discord
4. Create a new GitHub issue

## 📝 License

ISC

## 👥 Team

Built with ❤️ by the Skyll team

---

**Last Updated:** 2025-11-07
**Next.js:** 16.0.1 | **React:** 19.0.0 | **Node.js:** 18+ LTS
