# Sentry Testing Guide

This guide explains how to properly test your Sentry integration to ensure errors are being tracked correctly.

## Quick Start

1. **Visit the test page:**

   ```
   http://localhost:3000/sentry-test
   ```

2. **Check your environment variables** (see below)

3. **Choose your testing mode** (Development or Production)

4. **Trigger test errors** using the buttons on the test page

5. **Verify errors are captured** in console logs or Sentry dashboard

---

## Environment Variables

### Required Variables

Add these to your `.env.local` file:

```bash
# Server-side Sentry (for Server Components, API Routes, Server Actions)
SENTRY_DSN=https://xxxxx@oxxxxx.ingest.sentry.io/xxxxxx
SENTRY_ENVIRONMENT=development

# Client-side Sentry (for Client Components, Browser JavaScript)
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@oxxxxx.ingest.sentry.io/xxxxxx
NEXT_PUBLIC_SENTRY_ENVIRONMENT=development

# Optional: For source map uploads (not needed for local testing)
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
SENTRY_AUTH_TOKEN=your_auth_token
```

### Get Your Sentry DSN

1. Go to [sentry.io](https://sentry.io)
2. Navigate to **Settings** → **Projects** → **[Your Project]** → **Client Keys (DSN)**
3. Copy the DSN and paste it in your `.env.local`

---

## Testing Modes

### Mode 1: Development (Console Logging Only)

**Default behavior** - Errors are logged to console but **NOT sent to Sentry**.

**Best for:** Quick local testing without polluting your Sentry project.

**How it works:**

- The `beforeSend` hook intercepts all events
- Events are logged with `🔍 [Sentry Dev Mode]` prefix
- No data is sent to Sentry servers

**To use:**

1. Make sure `.env.local` has Sentry DSN configured
2. Start dev server: `pnpm dev`
3. Visit `http://localhost:3000/sentry-test`
4. Click any error button
5. Check browser console (F12) or terminal for logs

**What to look for:**

- Browser console: `🔍 [Sentry Dev Mode - Client] Event would be sent:`
- Server logs: `🔍 [Sentry Dev Mode - Server] Event would be sent:`

---

### Mode 2: Development (Send to Sentry)

**Opt-in behavior** - Errors are sent to Sentry even in development.

**Best for:** Testing that Sentry is configured correctly and receiving events.

**To enable:**

1. Add to `.env.local`:

   ```bash
   SENTRY_SEND_IN_DEV=true
   ```

2. Restart dev server: `pnpm dev`

3. Visit `http://localhost:3000/sentry-test`

4. Click any error button

5. Check Sentry dashboard: [sentry.io](https://sentry.io) → Issues

**What to look for:**

- Errors appear in Sentry dashboard within seconds
- Check **Issues** tab in your Sentry project
- Verify error context, tags, and breadcrumbs

---

### Mode 3: Production (Always Send to Sentry)

**Production behavior** - All errors are automatically sent to Sentry.

**Best for:** Final verification before deploying to production.

**To test:**

1. Build production bundle:

   ```bash
   pnpm build
   ```

2. Start production server:

   ```bash
   pnpm start
   ```

3. Visit `http://localhost:3000/sentry-test`

4. Trigger errors and check Sentry dashboard

**Important:** Remove `/sentry-test` route before deploying to production!

---

## Test Scenarios

The test page provides buttons to test different error scenarios:

### Client-Side Tests

| Button                       | What it tests         | Expected result                         |
| ---------------------------- | --------------------- | --------------------------------------- |
| **Throw Client Error**       | Unhandled React error | Error caught by Sentry's error boundary |
| **Capture Client Exception** | Manual error capture  | Error sent with custom tags/context     |
| **Capture Client Message**   | Custom log message    | Message appears as warning in Sentry    |
| **Test API Route (Success)** | Successful API call   | No error, confirms connectivity         |
| **Test API Route (Error)**   | API route error       | Server-side error captured              |

### Server-Side Tests

| Button                           | What it tests            | Expected result                   |
| -------------------------------- | ------------------------ | --------------------------------- |
| **Test Server Action (Success)** | Successful server action | Info message in Sentry (optional) |
| **Test Server Action (Error)**   | Server action error      | Server-side error captured        |

---

## Verifying Sentry Integration

### In Development Mode (Console Only)

✅ **Checklist:**

- [ ] Browser console shows: `🔍 [Sentry Dev Mode - Client] Event would be sent:`
- [ ] Server logs show: `🔍 [Sentry Dev Mode - Server] Event would be sent:`
- [ ] Event object contains correct error message
- [ ] Event includes tags and extra context

### In Development Mode (Send to Sentry)

✅ **Checklist:**

- [ ] Errors appear in Sentry dashboard within seconds
- [ ] Error stack traces are complete and readable
- [ ] Tags are correct (e.g., `test_type: 'client_manual'`)
- [ ] Extra context is attached to events
- [ ] User session info is captured (if applicable)

### In Production Mode

✅ **Checklist:**

- [ ] All test errors appear in Sentry
- [ ] Source maps are uploaded (if configured)
- [ ] Stack traces show original source code
- [ ] Performance traces are captured (check Performance tab)
- [ ] Session replays work (check Replays tab)

---

## Debugging Common Issues

### Issue: No events in Sentry dashboard

**Possible causes:**

1. DSN not configured correctly
   - Check `.env.local` has `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN`
   - Verify DSN format: `https://xxxxx@oxxxxx.ingest.sentry.io/xxxxxx`

2. Development mode is blocking events
   - Set `SENTRY_SEND_IN_DEV=true` in `.env.local`
   - Restart dev server

3. Firewall or ad-blocker blocking Sentry
   - Check browser console for network errors
   - Try disabling ad-blocker
   - Sentry tunnel route (`/monitoring`) should bypass blockers

### Issue: Events logged to console but not sent

**Expected behavior in development!**

- By design, events are logged but not sent unless `SENTRY_SEND_IN_DEV=true`
- This prevents development errors from polluting your Sentry project

### Issue: Source maps not working

**Solutions:**

1. Verify environment variables:

   ```bash
   SENTRY_ORG=your-org-slug
   SENTRY_PROJECT=your-project-slug
   SENTRY_AUTH_TOKEN=your_auth_token
   ```

2. Check build logs for upload errors

3. Ensure `hideSourceMaps: true` is in `next.config.ts` (already configured)

### Issue: Too many errors in Sentry

**Solutions:**

1. Adjust sample rates in Sentry config files:

   ```typescript
   tracesSampleRate: 0.1; // 10% of transactions
   replaysSessionSampleRate: 0.1; // 10% of sessions
   ```

2. Add error patterns to `ignoreErrors` array in config files

3. Use `beforeSend` hook to filter errors

---

## Advanced Testing

### Test Performance Monitoring

1. Enable debug mode:

   ```bash
   SENTRY_DEBUG=true
   ```

2. Navigate through your app

3. Check Sentry → Performance tab

4. Verify transaction traces are captured

### Test Session Replay

1. Perform user interactions on test page

2. Trigger an error

3. Check Sentry → Replays tab

4. Verify session replay is captured (with `maskAllText` privacy setting)

### Test Custom Context

See `apps/web/src/app/sentry-test/actions.ts` for examples of adding:

- Custom tags
- Extra context
- User information
- Breadcrumbs

---

## Cleanup

**Before deploying to production:**

1. Remove test files:

   ```bash
   rm -rf apps/web/src/app/sentry-test
   rm apps/web/src/app/api/sentry-test/route.ts
   ```

2. Remove this documentation:

   ```bash
   rm apps/web/SENTRY-TESTING.md
   ```

3. Remove development testing variables from production `.env`:
   ```bash
   # Remove or set to false
   SENTRY_SEND_IN_DEV=false
   SENTRY_DEBUG=false
   ```

---

## Additional Resources

- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Best Practices](https://docs.sentry.io/platforms/javascript/best-practices/)
- [Performance Monitoring](https://docs.sentry.io/platforms/javascript/performance/)
- [Session Replay](https://docs.sentry.io/platforms/javascript/session-replay/)

---

## Configuration Files Reference

- `apps/web/sentry.client.config.ts` - Client-side (browser) configuration
- `apps/web/sentry.server.config.ts` - Server-side (Node.js) configuration
- `apps/web/sentry.edge.config.ts` - Edge runtime (middleware) configuration
- `apps/web/next.config.ts` - Build-time Sentry options
