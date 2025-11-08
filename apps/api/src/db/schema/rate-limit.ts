import { pgTable, text, integer, bigint } from 'drizzle-orm/pg-core';

/**
 * Rate Limit Table
 *
 * Stores rate limiting data for Better-Auth to prevent brute force attacks.
 * Tracks request counts per key (usually IP address) and time window.
 *
 * Usage:
 * - Better-Auth automatically manages this table
 * - Records are created/updated on each rate-limited request
 * - Old records are cleaned up automatically
 *
 * Schema:
 * - id: Unique identifier for the rate limit record
 * - key: Identifier for the rate limit (usually IP address + endpoint)
 * - count: Number of requests made within the current window
 * - lastRequest: Timestamp of the last request (in milliseconds since epoch)
 */
export const rateLimit = pgTable('rate_limit', {
  id: text('id').primaryKey(),
  key: text('key'),
  count: integer('count'),
  lastRequest: bigint('last_request', { mode: 'number' }),
});
