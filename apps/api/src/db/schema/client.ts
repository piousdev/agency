import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

import { clientIndustryEnum, clientSizeEnum, clientTypeEnum, slaTierEnum } from './enums';

export const client = pgTable(
  'client',
  {
    id: text('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(), // Company/organization name
    type: clientTypeEnum('type').default('creative').notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(), // Primary contact email
    phone: varchar('phone', { length: 50 }),
    website: varchar('website', { length: 2048 }),
    address: text('address'),
    notes: text('notes'), // Internal notes (not visible to client users)
    active: boolean('active').default(true).notNull(),

    // ============================================
    // Industry-standard additions (HubSpot, Salesforce, Zendesk)
    // ============================================

    // Company profile
    industry: clientIndustryEnum('industry'),
    companySize: clientSizeEnum('company_size'),
    logo: varchar('logo', { length: 2048 }), // Company logo URL

    // Localization
    timezone: varchar('timezone', { length: 50 }), // e.g., "America/New_York"
    preferredLanguage: varchar('preferred_language', { length: 10 }), // e.g., "en-US"

    // Service level
    slaTier: slaTierEnum('sla_tier').default('silver'),

    // Contract information
    contractStartDate: timestamp('contract_start_date'),
    contractEndDate: timestamp('contract_end_date'),

    // Financial tracking
    annualValue: numeric('annual_value', { precision: 12, scale: 2 }), // Annual contract value
    currency: varchar('currency', { length: 3 }).default('USD'),

    // Billing address (separate from main address)
    billingAddress: text('billing_address'),
    billingEmail: varchar('billing_email', { length: 255 }),

    // Custom fields for extensibility
    customFields: jsonb('custom_fields').$type<Record<string, unknown>>().default({}),

    // Tags for categorization
    tags: jsonb('tags').$type<string[]>().default([]),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    // B-Tree index on type for filtering
    index('client_type_idx').on(table.type),
    // B-Tree index on active for filtering active clients
    index('client_active_idx').on(table.active),
    // Composite index for common query pattern (active clients by type)
    index('client_active_type_idx').on(table.active, table.type),
    // BRIN indexes on timestamps
    index('client_created_at_idx').using('brin', table.createdAt),
    index('client_updated_at_idx').using('brin', table.updatedAt),
    // Check constraint for email format
    check(
      'client_email_check',
      sql`${table.email} ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'`
    ),
    // New indexes for industry-standard fields
    index('client_industry_idx').on(table.industry),
    index('client_company_size_idx').on(table.companySize),
    index('client_sla_tier_idx').on(table.slaTier),
    index('client_contract_dates_idx').on(table.contractStartDate, table.contractEndDate),
    // GIN index for tags array search
    index('client_tags_idx').using('gin', table.tags),
  ]
);

export type Client = typeof client.$inferSelect;
export type NewClient = typeof client.$inferInsert;
