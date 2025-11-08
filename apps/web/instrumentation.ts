/**
 * Next.js Instrumentation Hook (Next.js 15+)
 *
 * This file is automatically loaded by Next.js to initialize monitoring tools.
 * It runs once when the application starts for each runtime (Node.js, Edge).
 *
 * Documentation:
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  /**
   * Initialize Sentry for Node.js runtime
   *
   * Handles:
   * - Server Components
   * - Server Actions
   * - API Routes (non-edge)
   * - getServerSideProps
   * - getStaticProps
   */
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  /**
   * Initialize Sentry for Edge runtime
   *
   * Handles:
   * - Middleware (proxy.ts)
   * - Edge API Routes
   * - Edge Server Components
   */
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}
