# Contributing Guide

Welcome! This guide explains the development workflow for the Skyll Platform.

## 🚀 Quick Start

### 1. Setup

```bash
# Clone and install
git clone https://github.com/piousdev/agency.git
cd agency
pnpm install

# Set up environment variables
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
# Fill in your values

# Push database schema
cd apps/api && pnpm db:push
```

### 2. Development

```bash
# Start both apps
pnpm dev

# Or individually
pnpm --filter @repo/api dev
pnpm --filter @repo/web dev
```

## 📝 Commit Workflow (Hybrid Approach)

We use **Conventional Commits** + **Changesets** for structured commits and controlled releases.

### Option 1: Interactive Commits (Recommended)

```bash
# Stage your changes
git add .

# Use interactive commit wizard
pnpm commit
```

This launches an interactive prompt that guides you through creating a properly formatted commit message:

```
? Select the type of change: (Use arrow keys)
❯ feat:     A new feature
  fix:      A bug fix
  docs:     Documentation only changes
  style:    Changes that don't affect code meaning
  refactor: Code change that neither fixes a bug nor adds a feature
  perf:     A code change that improves performance
  test:     Adding missing tests
```

### Option 2: Manual Commits

If you prefer to write commits manually, follow this format:

```bash
git commit -m "type(scope): subject"

# Examples:
git commit -m "feat: add user analytics dashboard"
git commit -m "fix: resolve login timeout issue"
git commit -m "feat(api): add health check endpoint"
git commit -m "docs: update deployment guide"
```

**Commit will be rejected if it doesn't follow the format!**

### Commit Types

| Type       | Description      | When to Use                              |
| ---------- | ---------------- | ---------------------------------------- |
| `feat`     | New feature      | Adding new functionality                 |
| `fix`      | Bug fix          | Fixing a bug                             |
| `docs`     | Documentation    | README, comments, guides                 |
| `style`    | Code style       | Formatting, semicolons (no logic change) |
| `refactor` | Code refactoring | Restructuring code (no behavior change)  |
| `perf`     | Performance      | Improving performance                    |
| `test`     | Tests            | Adding or updating tests                 |
| `build`    | Build system     | Dependencies, build tools                |
| `ci`       | CI/CD            | GitHub Actions, deployment               |
| `chore`    | Maintenance      | Tooling, configs, other tasks            |
| `revert`   | Revert           | Reverting a previous commit              |

### Commit Message Rules

✅ **DO:**

```bash
feat: add user dashboard with real-time metrics
fix: resolve database connection timeout
feat(web): implement dark mode toggle
docs: add API authentication guide
```

❌ **DON'T:**

```bash
Update code                    # Too vague
Fixed stuff                    # Not descriptive
Added new feature.             # Period at end
FEAT: Add dashboard           # Uppercase type
Feature: add dashboard        # Wrong type format
```

## 🔖 Versioning & Changesets

### When to Create a Changeset

Create a changeset when your changes affect users or developers:

✅ **Create changeset for:**

- New features or functionality
- Bug fixes that affect users
- Breaking changes (always!)
- Performance improvements
- Dependency updates that change behavior

❌ **Skip changeset for:**

- Documentation updates
- Internal refactoring (no behavior change)
- Test additions
- Configuration changes that don't affect output

### Creating a Changeset

After committing your code changes:

```bash
pnpm changeset
```

Follow the prompts:

1. **Select packages**: Choose `@repo/web`, `@repo/api`, or both
2. **Choose version bump**:
   - **MAJOR** (1.0.0 → 2.0.0): Breaking changes
   - **MINOR** (1.0.0 → 1.1.0): New features (backward-compatible)
   - **PATCH** (1.0.0 → 1.0.1): Bug fixes
3. **Write summary**: Clear description of what changed and why

### Complete Workflow Example

```bash
# 1. Create feature branch
git checkout -b feat/user-analytics

# 2. Make your changes
# ... code, code, code ...

# 3. Stage changes
git add .

# 4. Commit with Conventional Commits
pnpm commit
# Or manually: git commit -m "feat: add user analytics dashboard"

# 5. Create changeset
pnpm changeset
# Select: @repo/web
# Bump: minor
# Summary: "Add user analytics dashboard with real-time metrics"

# 6. Commit the changeset
git add .changeset/*.md
git commit -m "chore: add changeset for analytics feature"

# 7. Push and create PR
git push origin feat/user-analytics
```

## 🎯 Pull Request Process

### PR Checklist

Before creating a PR, ensure:

- [ ] Code follows project conventions (see `openspec/project.md`)
- [ ] All tests pass (`pnpm test`)
- [ ] Code is formatted (`pnpm format`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Commits follow Conventional Commits format
- [ ] Changeset created (if applicable)
- [ ] Documentation updated (if needed)

### PR Title Format

Use the same Conventional Commits format:

```
feat: add user analytics dashboard
fix: resolve login timeout issue
docs: update deployment guide
```

### PR Description Template

```markdown
## Description

Brief description of what this PR does

## Type of Change

- [ ] Bug fix (non-breaking)
- [ ] New feature (non-breaking)
- [ ] Breaking change
- [ ] Documentation update

## Changes Made

- Added user analytics dashboard
- Updated API to track user sessions
- Created analytics service

## Testing

- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manually tested locally

## Changeset

- [x] Changeset created
- [ ] No changeset needed (docs/tests only)

## Screenshots (if applicable)

[Add screenshots or GIFs]
```

## 🧪 Testing

### Running Tests

```bash
# All tests
pnpm test

# Watch mode
pnpm --filter @repo/api test:watch
pnpm --filter @repo/web test:watch

# E2E tests
cd apps/web && pnpm test:e2e

# Coverage
pnpm --filter @repo/api test:coverage
```

### Writing Tests

- **Unit tests**: For business logic, utilities, API handlers
- **Integration tests**: For API endpoints with database
- **E2E tests**: For critical user flows

Example:

```typescript
// apps/api/src/routes/users/__tests__/get-user.test.ts
import { describe, it, expect } from 'vitest';
import { app } from '../../../index';

describe('GET /api/users/:id', () => {
  it('should return user by id', async () => {
    const res = await app.request('/api/users/123');
    expect(res.status).toBe(200);
  });
});
```

## 📚 Project Structure

### Code Organization

```
apps/
├── api/              # Hono backend
│   ├── src/
│   │   ├── routes/   # Modular routes (one endpoint per file)
│   │   ├── schemas/  # Zod validation schemas
│   │   ├── lib/      # Shared utilities
│   │   └── middleware/
└── web/              # Next.js frontend
    ├── src/
    │   ├── app/      # App Router pages
    │   ├── components/
    │   └── lib/
```

### File Naming

- **kebab-case**: `user-service.ts`, `project-status.tsx`
- **PascalCase** for components: `ProjectDashboard.tsx`
- **camelCase** for functions: `getUserProjects`
- **UPPER_SNAKE_CASE** for constants: `MAX_RETRIES`

See `apps/web/ARCHITECTURE.md` and `apps/api/ARCHITECTURE.md` for detailed conventions.

## 🔧 Common Tasks

### Adding a Dependency

```bash
# To API
pnpm --filter @repo/api add <package>

# To Web
pnpm --filter @repo/web add <package>

# Dev dependency to root
pnpm add -D -w <package>
```

### Database Changes

```bash
# 1. Update schema in apps/api/src/db/schema/

# 2. Push to dev database
cd apps/api
pnpm db:push

# 3. For production, generate migration
pnpm db:generate
```

### Running Specific Package

```bash
pnpm --filter @repo/api <script>
pnpm --filter @repo/web <script>
```

## 🐛 Troubleshooting

### Commit Message Rejected

If your commit is rejected:

```bash
# Error: subject may not be empty
# Fix: Add a subject
git commit -m "feat: add user dashboard"

# Error: type must be one of [feat, fix, ...]
# Fix: Use valid type
git commit -m "feat: ..." # not "feature:"

# Error: subject must not end with '.'
# Fix: Remove period
git commit -m "feat: add dashboard" # not "feat: add dashboard."
```

### Changeset Issues

```bash
# View pending changesets
pnpm changeset:status

# Forgot to create changeset?
pnpm changeset
git add .changeset/*.md
git commit -m "chore: add missing changeset"
```

### Pre-commit Hook Issues

```bash
# Hook failing?
# 1. Check formatting
pnpm format

# 2. Check linting
pnpm lint

# 3. Fix issues and try again
git add .
git commit -m "fix: resolve linting issues"
```

## 📖 Additional Resources

- **[VERSIONING.md](./VERSIONING.md)** - Complete versioning guide
- **[README.md](./README.md)** - Project overview and setup
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment guide
- **[openspec/AGENTS.md](./openspec/AGENTS.md)** - OpenSpec workflow
- **[apps/web/ARCHITECTURE.md](./apps/web/ARCHITECTURE.md)** - Frontend patterns
- **[apps/api/ARCHITECTURE.md](./apps/api/ARCHITECTURE.md)** - Backend patterns

## 🤝 Code Review

### As a Reviewer

- Check for Conventional Commits compliance
- Verify changeset created (if needed)
- Test changes locally
- Review for security issues
- Ensure tests are adequate
- Check documentation updates

### As an Author

- Respond to feedback promptly
- Push fixes to the same branch
- Request re-review when ready
- Squash commits if needed before merge

## 🎓 Learning Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Changesets Documentation](https://github.com/changesets/changesets)
- [Semantic Versioning](https://semver.org/)

---

**Questions?** Ask in the team chat or create an issue.

**Happy coding!** 🚀
