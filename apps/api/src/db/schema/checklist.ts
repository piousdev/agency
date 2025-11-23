import { boolean, index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { ticket } from './ticket';
import { project } from './project';
import { user } from './user';

/**
 * Checklist container - can be attached to tickets or projects
 * Multiple checklists can be added to a single entity
 */
export const checklist = pgTable(
  'checklist',
  {
    id: text('id').primaryKey(),
    // Polymorphic: either ticket or project
    ticketId: text('ticket_id').references(() => ticket.id, { onDelete: 'cascade' }),
    projectId: text('project_id').references(() => project.id, { onDelete: 'cascade' }),
    title: text('title').notNull().default('Checklist'),
    sortOrder: integer('sort_order').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('checklist_ticket_id_idx').on(table.ticketId),
    index('checklist_project_id_idx').on(table.projectId),
  ]
);

/**
 * Individual checklist items
 * Can be checked/unchecked and reordered
 */
export const checklistItem = pgTable(
  'checklist_item',
  {
    id: text('id').primaryKey(),
    checklistId: text('checklist_id')
      .notNull()
      .references(() => checklist.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    completed: boolean('completed').default(false).notNull(),
    completedAt: timestamp('completed_at'),
    completedById: text('completed_by_id').references(() => user.id, { onDelete: 'set null' }),
    // Optional assignee for the item
    assigneeId: text('assignee_id').references(() => user.id, { onDelete: 'set null' }),
    // Optional due date for the item
    dueDate: timestamp('due_date'),
    sortOrder: integer('sort_order').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('checklist_item_checklist_id_idx').on(table.checklistId),
    index('checklist_item_completed_idx').on(table.completed),
    index('checklist_item_assignee_id_idx').on(table.assigneeId),
    index('checklist_item_sort_idx').on(table.checklistId, table.sortOrder),
  ]
);

export type Checklist = typeof checklist.$inferSelect;
export type NewChecklist = typeof checklist.$inferInsert;
export type ChecklistItem = typeof checklistItem.$inferSelect;
export type NewChecklistItem = typeof checklistItem.$inferInsert;
