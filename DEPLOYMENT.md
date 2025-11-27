# Deployment Guide - Skyll Platform

This guide covers deploying the Skyll Platform (API + Web) to Fly.io using the
2025 best practices.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Post-Deployment](#post-deployment)
- [Maintenance](#maintenance)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### 1. Install Fly.io CLI

**macOS:**

```bash
brew install flyctl
```

**Linux:**

```bash
curl -L https://fly.io/install.sh | sh
```

**Windows:**

```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

### 2. Create Fly.io Account

```bash
fly auth signup
# Or if you already have an account:
fly auth login
```

### 3. Verify Installation

```bash
fly version
```

---

## Initial Setup

### 1. Configure App Names

Edit the app names in the fly.toml files to ensure uniqueness:

**apps/api/fly.toml:**

```toml
app = "your-unique-api-name"  # Change this
primary_region = "ord"         # Change to your preferred region
```

**apps/web/fly.toml:**

```toml
app = "your-unique-web-name"   # Change this
primary_region = "ord"          # Change to your preferred region
```

**Available regions:** https://fly.io/docs/reference/regions/

Popular choices:

- `ord` - Chicago (US Central)
- `iad` - Virginia (US East)
- `sjc` - San Jose (US West)
- `lhr` - London (Europe)

### 2. Launch Apps (First Time Only)

This creates the apps on Fly.io without deploying yet:

```bash
# Launch API
cd apps/api
fly launch --no-deploy

# Launch Web
cd apps/web
fly launch --no-deploy
```

Follow the prompts:

- ✅ Confirm app name
- ✅ Select organization
- ✅ Choose region
- ❌ Don't deploy yet (we need to set secrets first)
- ❌ Don't create Postgres database (we're using Neon)

---

## Environment Variables

### API Environment Variables

Set these secrets for the API app:

```bash
cd apps/api

# Database URL from Neon
fly secrets set DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# Better Auth configuration
fly secrets set BETTER_AUTH_SECRET="$(openssl rand -base64 32)"
fly secrets set BETTER_AUTH_URL="https://your-web-app-name.fly.dev"
```

**Note:** Get your `DATABASE_URL` from your Neon dashboard.

### Web Environment Variables

Set these secrets for the Web app:

```bash
cd apps/web

# Better Auth configuration
fly secrets set BETTER_AUTH_SECRET="same-secret-as-api"
fly secrets set BETTER_AUTH_URL="https://your-web-app-name.fly.dev"
```

**Important:** The `BETTER_AUTH_SECRET` must be the same for both apps!

### Public Environment Variables

For `NEXT_PUBLIC_*` variables, set them at build time:

```bash
# Set this in your shell before deploying web app
export NEXT_PUBLIC_API_URL="https://your-api-app-name.fly.dev"
```

Or pass directly during deployment:

```bash
fly deploy --build-arg NEXT_PUBLIC_API_URL=https://your-api-app-name.fly.dev
```

### Verify Secrets

```bash
# View secrets (values are hidden for security)
fly secrets list --app your-api-app-name
fly secrets list --app your-web-app-name
```

---

## Deployment

### Option 1: Deploy from Root (Recommended)

```bash
# From project root
pnpm deploy:all
```

This deploys both API and Web apps sequentially.

### Option 2: Deploy Individually

**Deploy API:**

```bash
# From project root
pnpm deploy:api

# Or from apps/api
cd apps/api
pnpm deploy
```

**Deploy Web:**

```bash
# Set NEXT_PUBLIC_API_URL first!
export NEXT_PUBLIC_API_URL="https://your-api-app-name.fly.dev"

# From project root
pnpm deploy:web

# Or from apps/web
cd apps/web
pnpm deploy
```

### First Deployment Notes

- **Build time:** 2-5 minutes for first deployment
- **Machines:** Auto-start when needed, auto-stop when idle (cost optimization)
- **Scaling:** Starts with `min_machines_running = 0` (scales to zero)

---

## Post-Deployment

### 1. Verify Deployments

```bash
# Check status of both apps
pnpm fly:status

# Or individually
fly status --app your-api-app-name
fly status --app your-web-app-name
```

### 2. Test Health Endpoints

**API:**

```bash
curl https://your-api-app-name.fly.dev/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2025-11-07T...",
  "service": "Skyll Platform API"
}
```

**Web:**

```bash
curl https://your-web-app-name.fly.dev/
```

Should return HTML of the Next.js homepage.

### 3. View Logs

```bash
# From project root
pnpm fly:logs:api
pnpm fly:logs:web

# Or directly
fly logs --app your-api-app-name
fly logs --app your-web-app-name
```

### 4. Update CORS Configuration

The API currently allows `http://localhost:3000`. Update it to allow your
production web URL:

**apps/api/src/index.ts:**

```typescript
cors({
  origin:
    process.env.NODE_ENV === 'production'
      ? 'https://your-web-app-name.fly.dev'
      : 'http://localhost:3000',
  credentials: true,
});
```

Then redeploy the API.

---

## Maintenance

### Viewing Application Metrics

```bash
fly dashboard --app your-api-app-name
fly dashboard --app your-web-app-name
```

### Scaling

**Increase VM memory:**

```bash
fly scale memory 1024 --app your-api-app-name
```

**Set minimum running machines:**

```bash
# Keep at least 1 machine always running
fly scale count 1 --app your-api-app-name
```

Or edit `fly.toml`:

```toml
[http_service]
  min_machines_running = 1  # Change from 0
```

### SSH into Machine

```bash
fly ssh console --app your-api-app-name
```

### Database Migrations

Run migrations directly on the deployed API:

```bash
fly ssh console --app your-api-app-name

# Inside the container
cd /home/node/app/apps/api
node_modules/.bin/drizzle-kit push
```

Or create a one-off machine:

```bash
fly machine run --app your-api-app-name --command "pnpm --filter @repo/api db:push"
```

---

## Troubleshooting

### Build Failures

**Problem:** Dockerfile build fails

**Solution:**

```bash
# Build locally first to test
docker build -f apps/api/Dockerfile -t test-api .
docker build -f apps/web/Dockerfile -t test-web \
  --build-arg NEXT_PUBLIC_API_URL=https://test.com .
```

### Health Check Failures

**Problem:** App fails health checks

**Diagnostic:**

```bash
fly logs --app your-app-name
fly ssh console --app your-app-name

# Inside container, test locally
curl http://localhost:8000/health  # For API
curl http://localhost:3000/        # For Web
```

### Environment Variable Issues

**Problem:** App can't find environment variables

**Check:**

```bash
fly secrets list --app your-app-name

# SSH into machine and check
fly ssh console --app your-app-name
env | grep DATABASE_URL
env | grep BETTER_AUTH
```

### Database Connection Issues

**Problem:** API can't connect to Neon

**Solution:**

1. Verify `DATABASE_URL` is correct (check Neon dashboard)
2. Ensure `?sslmode=require` is in the connection string
3. Check Neon IP allowlist (if configured)

```bash
# Test connection from Fly machine
fly ssh console --app your-api-app-name
node -e "console.log(process.env.DATABASE_URL)"
```

### Next.js Build Issues

**Problem:** `standalone` output missing files

**Solution:**

- Ensure `output: "standalone"` is in `next.config.ts`
- Rebuild locally: `pnpm --filter @repo/web build`
- Check `.next/standalone` directory exists

### CORS Errors

**Problem:** Web app can't reach API

**Solution:**

1. Update API CORS origin to production URL
2. Ensure `credentials: true` is set
3. Verify `NEXT_PUBLIC_API_URL` is correct in web app

```bash
# Check in browser console
console.log(process.env.NEXT_PUBLIC_API_URL)
```

### Logs Not Showing

**Problem:** `fly logs` shows nothing

**Try:**

```bash
# Tail logs in real-time
fly logs --app your-app-name --follow

# View more history
fly logs --app your-app-name --lines 100
```

### Cost Concerns

**Check usage:**

```bash
fly dashboard
```

**Optimize:**

- Keep `min_machines_running = 0` (already configured)
- Use smaller VM sizes: `memory_mb = 256` for API
- Monitor with `fly scale show --app your-app-name`

---

## CI/CD Setup (Optional)

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Fly.io

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: superfly/flyctl-actions/setup-flyctl@master

      - name: Deploy API
        run: fly deploy --config apps/api/fly.toml
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}

      - name: Deploy Web
        run:
          fly deploy --config apps/web/fly.toml --build-arg
          NEXT_PUBLIC_API_URL=${{ secrets.NEXT_PUBLIC_API_URL }}
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

**Set secrets in GitHub:**

- `FLY_API_TOKEN`: Get from `fly tokens create deploy`
- `NEXT_PUBLIC_API_URL`: Your API URL

---

## Useful Commands Reference

```bash
# Status
fly status --app <app-name>

# Logs
fly logs --app <app-name> --follow

# Open in browser
fly open --app <app-name>

# Scale
fly scale memory 512 --app <app-name>
fly scale count 1 --app <app-name>

# SSH
fly ssh console --app <app-name>

# Restart
fly machine restart <machine-id> --app <app-name>

# Destroy app (careful!)
fly apps destroy <app-name>
```

---

## Support

- **Fly.io Docs:** https://fly.io/docs
- **Fly.io Community:** https://community.fly.io
- **Project Issues:** https://github.com/your-org/agency/issues

---

**Last Updated:** 2025-11-07 **Fly.io Best Practices Version:** 2025
