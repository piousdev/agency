# Package Manager Conventions

## IMPORTANT: This project uses pnpm, NOT npm or npx

### Correct Usage

**Running package scripts:**

```bash
# Root level
pnpm build
pnpm lint
pnpm test

# Specific workspace
pnpm --filter @repo/api dev
pnpm --filter @repo/web dev
pnpm --filter @repo/api db:generate
pnpm --filter @repo/api db:migrate
pnpm --filter @repo/api db:seed
```

**Running binaries (instead of npx):**

```bash
# WRONG - Never use npx
npx drizzle-kit generate  # ❌ WRONG

# CORRECT - Use pnpm exec or workspace scripts
pnpm --filter @repo/api db:generate  # ✅ CORRECT
pnpm exec drizzle-kit generate       # ✅ Also correct
```

### Available API Scripts

- `pnpm --filter @repo/api db:generate` - Generate Drizzle migrations
- `pnpm --filter @repo/api db:migrate` - Run Drizzle migrations
- `pnpm --filter @repo/api db:push` - Push schema changes directly
- `pnpm --filter @repo/api db:studio` - Open Drizzle Studio
- `pnpm --filter @repo/api db:seed` - Seed the database

### Why This Matters

- Consistency across the team
- Proper workspace resolution
- Correct dependency versions from lockfile
- Avoids phantom dependencies
