import { sql } from 'drizzle-orm';
import { check, index, integer, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { comment } from './comment';
import { project } from './project';
import { ticket } from './ticket';
import { user } from './user';

export const file = pgTable(
  'file',
  {
    id: text('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    key: varchar('key', { length: 1024 }).notNull().unique(), // R2 storage key
    url: varchar('url', { length: 2048 }).notNull(), // Public or presigned URL
    mimeType: varchar('mime_type', { length: 127 }).notNull(),
    size: integer('size').notNull(), // Size in bytes
    projectId: text('project_id').references(() => project.id, {
      onDelete: 'set null',
    }),
    ticketId: text('ticket_id').references(() => ticket.id, {
      onDelete: 'set null',
    }),
    commentId: text('comment_id').references(() => comment.id, {
      onDelete: 'set null',
    }),
    uploadedById: text('uploaded_by_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    // B-Tree indexes on foreign keys
    index('file_project_id_idx').on(table.projectId),
    index('file_ticket_id_idx').on(table.ticketId),
    index('file_comment_id_idx').on(table.commentId),
    index('file_uploaded_by_id_idx').on(table.uploadedById),
    // B-Tree index on mimeType for filtering by file type
    index('file_mime_type_idx').on(table.mimeType),
    // BRIN index on timestamp
    index('file_created_at_idx').using('brin', table.createdAt),
    // Check constraint for positive file size
    check('file_size_check', sql`${table.size} > 0`),
  ]
);

export type File = typeof file.$inferSelect;
export type NewFile = typeof file.$inferInsert;
