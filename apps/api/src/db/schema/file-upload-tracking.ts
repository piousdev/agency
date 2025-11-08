import { sql } from 'drizzle-orm';
import { check, index, pgEnum, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { user } from './user';

/**
 * File Upload Tracking Table
 *
 * Tracks files uploaded via presigned URLs to enable orphaned file cleanup.
 * Files remain in "pending" state until confirmed via /api/files/confirm.
 * Cleanup job deletes unconfirmed files older than 24 hours.
 */

export const uploadStatusEnum = pgEnum('upload_status', ['pending', 'confirmed', 'failed']);

export const fileUploadTracking = pgTable(
  'file_upload_tracking',
  {
    id: text('id').primaryKey(),
    key: varchar('key', { length: 1024 }).notNull().unique(), // R2 storage key
    uploadedById: text('uploaded_by_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    status: uploadStatusEnum('status').notNull().default('pending'),
    createdAt: timestamp('created_at').defaultNow().notNull(), // When presigned URL was generated
    confirmedAt: timestamp('confirmed_at'), // When file was confirmed
    expiresAt: timestamp('expires_at').notNull(), // Grace period expiration (createdAt + 24h)
  },
  (table) => [
    // B-Tree index on key for fast lookup during confirmation
    index('file_upload_tracking_key_idx').on(table.key),
    // B-Tree index on uploadedById for user-specific queries
    index('file_upload_tracking_uploaded_by_id_idx').on(table.uploadedById),
    // Composite index on status and expiresAt for cleanup job
    // This allows efficient queries: WHERE status = 'pending' AND expiresAt < NOW()
    index('file_upload_tracking_cleanup_idx').on(table.status, table.expiresAt),
    // BRIN index on createdAt for time-based queries
    index('file_upload_tracking_created_at_idx').using('brin', table.createdAt),
    // Check constraint: confirmedAt must be after createdAt
    check(
      'file_upload_tracking_confirmed_after_created',
      sql`${table.confirmedAt} IS NULL OR ${table.confirmedAt} >= ${table.createdAt}`
    ),
    // Check constraint: expiresAt must be after createdAt
    check(
      'file_upload_tracking_expires_after_created',
      sql`${table.expiresAt} > ${table.createdAt}`
    ),
  ]
);

export type FileUploadTracking = typeof fileUploadTracking.$inferSelect;
export type NewFileUploadTracking = typeof fileUploadTracking.$inferInsert;
