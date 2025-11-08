# Skyll Platform API

Backend API server for the Skyll Platform, built with Hono v4, TypeScript, Drizzle ORM, and Neon Postgres.

## 🎯 Overview

The API provides:

- **Authentication** - Email/password auth via BetterAuth
- **User Management** - CRUD operations for users and sessions
- **Client Management** - Handle different client types (A, B, C, one-time)
- **Role-Based Access** - Granular permissions and role management
- **Database Operations** - Powered by Drizzle ORM + Neon Postgres

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│          HTTP Request                    │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│      Hono Middleware Chain               │
│  - Logger                                │
│  - CORS                                  │
│  - Auth (future)                         │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│          Route Handlers                  │
│  /health      - Health check             │
│  /api/auth/*  - BetterAuth endpoints     │
│  /db/test     - Database test            │
│  (future routes)                         │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│       Drizzle ORM Layer                  │
│  - Query builder                         │
│  - Type-safe operations                  │
│  - Migration management                  │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│      Neon Postgres Database              │
│  - PostgreSQL 17.5                       │
│  - Serverless, auto-scaling              │
└─────────────────────────────────────────┘
```

## 🚀 Tech Stack

- **Framework:** Hono v4.0.0
- **Runtime:** Node.js (via @hono/node-server)
- **Language:** TypeScript v5.1.0
- **ORM:** Drizzle ORM v0.44.7
- **Database:** Neon Postgres (serverless)
- **Validation:** Zod v4.1.12
- **Auth:** BetterAuth v1.x

## 📂 Project Structure

```
apps/api/
├── src/
│   ├── db/
│   │   ├── schema/              # Database schemas (Drizzle)
│   │   │   ├── user.ts          # User table
│   │   │   ├── role.ts          # Role & role assignment tables
│   │   │   ├── session.ts       # Session table
│   │   │   ├── account.ts       # OAuth accounts
│   │   │   ├── invitation.ts    # Invitation table
│   │   │   ├── client.ts        # Client table
│   │   │   ├── project.ts       # Project table
│   │   │   └── index.ts         # Schema exports
│   │   └── index.ts             # DB connection
│   │
│   ├── schemas/                 # ✨ Zod validation schemas (centralized)
│   │   ├── user.ts              # User validation schemas
│   │   ├── role.ts              # Role validation schemas
│   │   └── invitation.ts        # Invitation validation schemas
│   │
│   ├── lib/
│   │   └── auth.ts              # BetterAuth instance
│   │
│   ├── middleware/
│   │   ├── auth.ts              # Auth middleware
│   │   └── error-handler.ts    # Global error handler
│   │
│   ├── routes/                  # ✨ Modular route structure (SOC/SRP)
│   │   ├── users/               # User management (8 files)
│   │   │   ├── index.ts         # Router composition
│   │   │   ├── list.ts          # GET /api/users
│   │   │   ├── get.ts           # GET /api/users/:id
│   │   │   ├── update.ts        # PATCH /api/users/:id
│   │   │   ├── delete.ts        # DELETE /api/users/:id
│   │   │   ├── internal-status.ts # PATCH /api/users/:id/internal-status
│   │   │   ├── expiration.ts    # PATCH /api/users/:id/extend-expiration
│   │   │   └── roles.ts         # Role assignment endpoints
│   │   │
│   │   ├── roles/               # Role management (3 files)
│   │   │   ├── index.ts
│   │   │   ├── list.ts          # GET /api/roles
│   │   │   └── get.ts           # GET /api/roles/:id
│   │   │
│   │   ├── invitations/         # Invitation system (4 files)
│   │   │   ├── index.ts
│   │   │   ├── create.ts        # POST /api/invitations/create
│   │   │   ├── validate.ts      # GET /api/invitations/validate/:token
│   │   │   └── accept.ts        # POST /api/invitations/accept
│   │   │
│   │   └── db-test.ts           # Database test routes
│   │
│   └── index.ts                 # Entry point
│
├── drizzle/                     # Generated migrations
├── ARCHITECTURE.md              # ✨ Architecture & coding standards
├── Dockerfile                   # Production container
├── drizzle.config.ts            # Drizzle configuration
├── fly.toml                     # Fly.io deployment config
├── package.json
├── tsconfig.json
└── vitest.config.ts             # Test configuration
```

### Key Architectural Decisions

**✨ NEW: SOC/SRP Principles**

- **250-line limit per file** (strictly enforced)
- **Centralized schemas** in `src/schemas/` (not in route folders)
- **Modular routes** with one endpoint per file
- **Composable routers** using `index.ts` files

See **[ARCHITECTURE.md](./ARCHITECTURE.md)** for complete guidelines.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ LTS
- pnpm 9.0.0
- Neon Postgres database

### Installation

```bash
# From project root
pnpm install

# Or from this directory
pnpm install
```

### Environment Variables

Create `.env` file (use `.env.example` as template):

```bash
# Database
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-here"  # openssl rand -base64 32
BETTER_AUTH_URL="http://localhost:3000"

# Server
PORT=8000
NODE_ENV=development
```

### Database Setup

```bash
# Push schema to database (development)
pnpm db:push

# Generate migrations (production)
pnpm db:generate

# Run migrations (production)
pnpm db:migrate

# Open Drizzle Studio (GUI)
pnpm db:studio
```

### Development

```bash
# Start dev server with hot reload
pnpm dev

# Server runs on http://localhost:8000
```

## 📡 API Endpoints

### Health & Status

```http
GET /health
```

Response:

```json
{
  "status": "ok",
  "timestamp": "2025-11-07T12:00:00.000Z",
  "service": "Skyll Platform API"
}
```

---

```http
GET /
```

Response:

```json
{
  "message": "Skyll Platform API",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "db": "/db/test",
    "auth": "/api/auth"
  }
}
```

### Authentication (BetterAuth)

All authentication endpoints are handled by BetterAuth:

```http
POST /api/auth/sign-in
POST /api/auth/sign-up
POST /api/auth/sign-out
GET  /api/auth/get-session
```

See [BetterAuth docs](https://better-auth.com) for full API reference.

### Database Test

```http
GET /db/test
```

Tests database connection and returns current timestamp.

### User Management (Admin)

All user endpoints require authentication and internal team member status.

**List Users:**

```http
GET /api/users?page=1&pageSize=20&sortBy=createdAt&sortOrder=desc&search=john&isInternal=all
```

**Get Single User:**

```http
GET /api/users/:id
```

**Update User:**

```http
PATCH /api/users/:id
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "admin",
  "isInternal": true,
  "expiresAt": "2025-12-31T23:59:59Z"
}
```

**Delete User:**

```http
DELETE /api/users/:id
```

**Toggle Internal Status:**

```http
PATCH /api/users/:id/internal-status
Content-Type: application/json

{
  "isInternal": true
}
```

**Extend Expiration:**

```http
PATCH /api/users/:id/extend-expiration
Content-Type: application/json

{
  "expiresAt": "2025-12-31T23:59:59Z"
}
```

**Assign Role:**

```http
POST /api/users/:id/assign-role
Content-Type: application/json

{
  "roleId": "role_abc123"
}
```

**Remove Role:**

```http
DELETE /api/users/:id/roles/:roleId
```

### Role Management (Admin)

**List Roles:**

```http
GET /api/roles?page=1&pageSize=50&sortBy=name&sortOrder=asc&roleType=all
```

**Get Single Role:**

```http
GET /api/roles/:id
```

### Invitations

**Create Invitation (Admin):**

```http
POST /api/invitations/create
Content-Type: application/json

{
  "email": "client@example.com",
  "clientType": "software",
  "clientId": "client_abc123"
}
```

**Validate Invitation (Public):**

```http
GET /api/invitations/validate/:token
```

**Accept Invitation (Public):**

```http
POST /api/invitations/accept
Content-Type: application/json

{
  "token": "invitation_token_here",
  "name": "John Doe",
  "email": "client@example.com",
  "password": "SecurePass123!"
}
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run with UI
pnpm test:ui

# Generate coverage
pnpm test:coverage
```

### Writing Tests

Tests use Vitest. Example:

```typescript
// src/routes/__tests__/health.test.ts
import { describe, it, expect } from 'vitest';
import app from '../../index';

describe('GET /health', () => {
  it('returns ok status', async () => {
    const res = await app.request('/health');
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.status).toBe('ok');
  });
});
```

## 🗄️ Database

### Schema Management

Schemas are organized by domain in `src/db/schema/`:

**users.ts:**

```typescript
export const users = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull(),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
});
```

### Migrations

```bash
# Development: push changes directly
pnpm db:push

# Production: use migrations
pnpm db:generate  # Generate migration files
pnpm db:migrate   # Apply migrations
```

### Drizzle Studio

Interactive GUI for database management:

```bash
pnpm db:studio
# Opens https://local.drizzle.studio
```

## 🔐 Authentication

### BetterAuth Configuration

Located in `src/lib/auth.ts`:

```typescript
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../db';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: ['http://localhost:3000'],
});
```

### Auth Endpoints

BetterAuth auto-generates these endpoints:

- `POST /api/auth/sign-in` - Email/password login
- `POST /api/auth/sign-up` - User registration
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/get-session` - Get current session

### Adding Custom Auth Middleware

```typescript
// src/middleware/auth.ts
import { auth } from '../lib/auth';
import { createMiddleware } from 'hono/factory';

export const requireAuth = createMiddleware(async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  c.set('session', session);
  await next();
});
```

## 🛠️ Development

### Available Scripts

```bash
pnpm dev              # Start dev server with hot reload
pnpm build            # Compile TypeScript
pnpm start            # Run production build
pnpm lint             # Lint code
pnpm test             # Run tests
pnpm test:watch       # Run tests in watch mode
pnpm test:ui          # Run tests with UI
pnpm test:coverage    # Generate coverage report

# Database
pnpm db:push          # Push schema (dev)
pnpm db:generate      # Generate migrations
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Drizzle Studio

# Deployment
pnpm deploy           # Deploy to Fly.io
pnpm fly:launch       # Initialize Fly.io app
pnpm fly:status       # Check deployment status
pnpm fly:logs         # View logs
pnpm fly:ssh          # SSH into container
```

### Adding New Routes

1. Create route file in `src/routes/`:

```typescript
// src/routes/users.ts
import { Hono } from 'hono';
import { db } from '../db';
import { users } from '../db/schema';

const app = new Hono();

app.get('/', async (c) => {
  const allUsers = await db.select().from(users);
  return c.json(allUsers);
});

export default app;
```

2. Mount in `src/index.ts`:

```typescript
import userRoutes from './routes/users';

app.route('/users', userRoutes);
```

### Adding Database Tables

1. Create schema in `src/db/schema/`:

```typescript
// src/db/schema/projects.ts
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const projects = pgTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
});
```

2. Export from `src/db/schema/index.ts`:

```typescript
export * from './projects';
```

3. Push or migrate:

```bash
pnpm db:push  # Development
# OR
pnpm db:generate && pnpm db:migrate  # Production
```

## 🚢 Deployment

See **[../../DEPLOYMENT.md](../../DEPLOYMENT.md)** for complete deployment guide.

Quick deploy:

```bash
# From this directory
pnpm deploy

# Or from root
pnpm deploy:api
```

### Environment Variables (Production)

Set via Fly.io CLI:

```bash
fly secrets set DATABASE_URL="your-neon-url"
fly secrets set BETTER_AUTH_SECRET="your-secret"
fly secrets set BETTER_AUTH_URL="https://your-web-app.fly.dev"
```

### Docker Build

```bash
# Build locally
docker build -f Dockerfile -t skyll-api ../../

# Test locally
docker run -p 8000:8000 --env-file .env skyll-api
```

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Test connection
node -e "require('dotenv/config'); console.log(process.env.DATABASE_URL)"

# Verify SSL mode
# Connection string must include: ?sslmode=require
```

### Port Already in Use

```bash
lsof -ti:8000 | xargs kill -9
```

### TypeScript Errors

```bash
# Clear build cache
rm -rf dist/

# Rebuild
pnpm build
```

### Migration Issues

```bash
# Reset database (caution: deletes data)
pnpm db:push --force

# Or manually in Neon console
```

## 📚 Resources

- **Hono:** https://hono.dev
- **Drizzle ORM:** https://orm.drizzle.team
- **BetterAuth:** https://better-auth.com
- **Neon Postgres:** https://neon.tech/docs
- **Zod:** https://zod.dev

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Add tests
4. Run `pnpm lint` and `pnpm test`
5. Create pull request

## 📝 License

ISC

---

**Last Updated:** 2025-11-07
**API Version:** 1.0.0
