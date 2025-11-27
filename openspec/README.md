# OpenSpec Documentation

This directory contains all OpenSpec proposals, specifications, and project
documentation for the Skyll Platform.

## 📁 Directory Structure

```
openspec/
├── STATUS.md                          # Current implementation status
├── project.md                         # Project context, tech stack, conventions
├── changes/                           # All change proposals
│   ├── add-project-infrastructure/    # Infrastructure setup (60% complete)
│   ├── add-user-authentication/       # Authentication system (25% complete)
│   └── archive/                       # Completed/archived proposals
└── README.md                          # This file
```

## 🚀 Quick Start

### Check Current Status

Read [`STATUS.md`](./STATUS.md) for:

- ✅ What's been completed
- 🚧 What's in progress
- ⏳ What's pending
- 🔧 Key fixes applied
- 📊 Progress summary

### Understand the Project

Read [`project.md`](./project.md) for:

- Project purpose and business context
- Complete tech stack with versions
- Code conventions and patterns
- Architecture decisions
- Domain model (client types, subscriptions, roles)

### View Change Proposals

Each proposal in `changes/` contains:

- `proposal.md` - Why this change, what it does, impact
- `tasks.md` - Implementation checklist
- `design.md` - Technical decisions
- `specs/` - Detailed specifications with requirements

## 📊 Current Project Status

### Infrastructure (60% Complete)

- ✅ Turborepo + pnpm monorepo setup
- ✅ Next.js 16 + React 19 configured
- ✅ Hono API operational
- ✅ Drizzle ORM + Neon Postgres connected
- ✅ Environment variables (Turborepo 2025 best practices)
- ⏳ Development tooling (ESLint, Prettier, Git hooks)
- ⏳ Testing infrastructure (Vitest, Playwright, k6)
- ⏳ Deployment configuration (Fly.io)

### Authentication (25% Complete)

- ✅ BetterAuth base setup with Drizzle
- ✅ Database schemas (users, accounts, sessions, verifications)
- ✅ Hono API integration
- ✅ Next.js client integration
- ⏳ Skyll-specific user fields
- ⏳ Invitation system
- ⏳ Role-based access control
- ⏳ Authentication UI

## 🛠️ Tech Stack (Current)

```
Frontend:  Next.js 16.0.1 + React 19.0.0 + Tailwind CSS v4.1.17
Backend:   Hono v4.0.0 + Node.js
Database:  Neon Postgres 17.5 + Drizzle ORM v0.44.7
Auth:      BetterAuth v1.x (Base setup complete ✅)
State:     Zustand + TanStack Query
Forms:     React Hook Form + Zod v4.1.12
Monorepo:  Turborepo v2.6.0 + pnpm v9.0.0
```

## 📝 Development Workflow

1. **Before Starting Work**
   - Check STATUS.md for current state
   - Review relevant proposal in changes/
   - Verify tasks are not already complete

2. **During Development**
   - Follow conventions in project.md
   - Update task lists as you progress
   - Use docs-first approach (fetch latest docs)

3. **After Completion**
   - Update STATUS.md
   - Mark tasks complete in proposal
   - Update project.md if tech stack changed

## 🔍 Key Files

| File                    | Purpose                         |
| ----------------------- | ------------------------------- |
| `STATUS.md`             | Implementation progress tracker |
| `project.md`            | Project context & conventions   |
| `changes/*/proposal.md` | Change justification & overview |
| `changes/*/tasks.md`    | Implementation checklist        |
| `changes/*/design.md`   | Technical decisions             |
| `changes/*/specs/*.md`  | Detailed requirements           |

## 🎯 Next Actions

Based on STATUS.md, recommended next steps:

1. **Extend Authentication** (High Priority)
   - Add Skyll-specific user fields
   - Implement invitation system
   - Build role-based access control

2. **Development Tooling** (Medium Priority)
   - Set up Prettier + ESLint
   - Add pre-commit hooks
   - Configure VS Code settings

3. **Core Features** (After Auth)
   - Client management
   - Project tracking
   - Service request system

## 📚 Additional Resources

- **OpenSpec CLI**: Run validation with `openspec validate --strict`
- **Documentation**: All implementations follow 2025 best practices
- **Architecture**: See project.md for patterns and conventions

---

**Last Updated**: 2025-11-07 **Project**: Skyll Platform (Internal Operations
System) **Scale Target**: 1M+ users globally
