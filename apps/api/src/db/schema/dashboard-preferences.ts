import { index, jsonb, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core';

import { user } from './user';

// Widget layout configuration type
export interface WidgetLayout {
  id: string;
  type: string;
  size: 'small' | 'medium' | 'large';
  position: number;
  visible: boolean;
}

// Widget-specific configuration type
export interface WidgetConfig {
  filters?: Record<string, unknown>;
  displayOptions?: Record<string, unknown>;
  refreshInterval?: number;
}

/**
 * User dashboard preferences table
 * Stores per-user dashboard layout and widget visibility settings
 */
export const userDashboardPreferences = pgTable(
  'user_dashboard_preferences',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    // Widget layout array with position and visibility
    layout: jsonb('layout').$type<WidgetLayout[]>().notNull().default([]),
    // Collapsed widget IDs
    collapsedWidgets: text('collapsed_widgets').array().default([]),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    // Ensure one preferences record per user
    unique('user_dashboard_preferences_user_id_unique').on(table.userId),
    // Index for user lookups
    index('user_dashboard_preferences_user_id_idx').on(table.userId),
  ]
);

/**
 * Widget configurations table
 * Stores per-user, per-widget settings (filters, display options, etc.)
 */
export const widgetConfiguration = pgTable(
  'widget_configuration',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    widgetType: text('widget_type').notNull(),
    config: jsonb('config').$type<WidgetConfig>().notNull().default({}),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    // Ensure one config per user per widget type
    unique('widget_configuration_user_widget_unique').on(table.userId, table.widgetType),
    // Index for user lookups
    index('widget_configuration_user_id_idx').on(table.userId),
    // Index for widget type filtering
    index('widget_configuration_widget_type_idx').on(table.widgetType),
  ]
);

export type UserDashboardPreferences = typeof userDashboardPreferences.$inferSelect;
export type NewUserDashboardPreferences = typeof userDashboardPreferences.$inferInsert;

export type WidgetConfiguration = typeof widgetConfiguration.$inferSelect;
export type NewWidgetConfiguration = typeof widgetConfiguration.$inferInsert;
