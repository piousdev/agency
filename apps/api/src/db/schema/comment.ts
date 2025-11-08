import { sql } from 'drizzle-orm';
import { boolean, index, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { project } from './project';
import { ticket } from './ticket';
import { user } from './user';

export const comment = pgTable(
  'comment',
  {
    id: text('id').primaryKey(),
    content: text('content').notNull(),
    ticketId: text('ticket_id').references(() => ticket.id, {
      onDelete: 'cascade',
    }),
    projectId: text('project_id').references(() => project.id, {
      onDelete: 'cascade',
    }),
    authorId: text('author_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    isInternal: boolean('is_internal').default(false).notNull(), // Hidden from clients
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    // B-Tree indexes on foreign keys
    index('comment_ticket_id_idx').on(table.ticketId),
    index('comment_project_id_idx').on(table.projectId),
    index('comment_author_id_idx').on(table.authorId),
    // B-Tree index on isInternal for filtering
    index('comment_is_internal_idx').on(table.isInternal),
    // Composite index for filtering ticket comments by visibility
    index('comment_ticket_internal_idx').on(table.ticketId, table.isInternal),
    // GIN index for full-text search on content
    index('comment_search_idx').using('gin', sql`to_tsvector('english', ${table.content})`),
    // BRIN indexes on timestamps
    index('comment_created_at_idx').using('brin', table.createdAt),
    index('comment_updated_at_idx').using('brin', table.updatedAt),
  ]
);

export type Comment = typeof comment.$inferSelect;
export type NewComment = typeof comment.$inferInsert;
