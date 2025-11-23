import { pgEnum } from 'drizzle-orm/pg-core';

// ============================================
// User & Auth Enums
// ============================================
export const userRoleEnum = pgEnum('user_role', ['admin', 'editor', 'client']);

// ============================================
// Project Enums
// ============================================
export const projectStatusEnum = pgEnum('project_status', [
  'proposal',
  'in_development',
  'in_review',
  'delivered',
  'on_hold',
  'maintenance',
  'archived',
]);

export const projectPriorityEnum = pgEnum('project_priority', ['low', 'medium', 'high', 'urgent']);

export const projectVisibilityEnum = pgEnum('project_visibility', [
  'private', // Only assigned team members
  'team', // All internal team members
  'client', // Client can also view
  'public', // Anyone with link (portfolio)
]);

// ============================================
// Ticket Enums
// ============================================
export const ticketTypeEnum = pgEnum('ticket_type', [
  'intake',
  'bug',
  'support',
  'incident',
  'change_request',
  'feature_request',
  'task',
  'story', // Agile user story
  'epic', // Agile epic
]);

export const ticketStatusEnum = pgEnum('ticket_status', [
  'open',
  'in_progress',
  'pending_client',
  'resolved',
  'closed',
]);

export const ticketPriorityEnum = pgEnum('ticket_priority', ['low', 'medium', 'high', 'critical']);

export const ticketResolutionEnum = pgEnum('ticket_resolution', [
  'fixed', // Issue was fixed
  'wont_fix', // Decision not to fix
  'duplicate', // Duplicate of another ticket
  'cannot_reproduce', // Cannot reproduce the issue
  'not_a_bug', // Working as intended
  'done', // Task completed
  'incomplete', // Partially completed
  'cancelled', // Cancelled by requester
]);

// ============================================
// Client Enums
// ============================================
export const clientTypeEnum = pgEnum('client_type', [
  'creative',
  'software',
  'full_service',
  'one_time',
]);

export const clientIndustryEnum = pgEnum('client_industry', [
  'technology',
  'healthcare',
  'finance',
  'education',
  'retail',
  'manufacturing',
  'media',
  'real_estate',
  'hospitality',
  'nonprofit',
  'government',
  'professional_services',
  'other',
]);

export const clientSizeEnum = pgEnum('client_size', [
  'startup', // 1-10 employees
  'small', // 11-50 employees
  'medium', // 51-200 employees
  'large', // 201-1000 employees
  'enterprise', // 1000+ employees
]);

export const slaTierEnum = pgEnum('sla_tier', [
  'bronze', // Basic support
  'silver', // Standard support
  'gold', // Priority support
  'platinum', // Premium 24/7 support
]);

export const contactRoleEnum = pgEnum('contact_role', [
  'primary', // Main point of contact
  'billing', // Billing/invoicing contact
  'technical', // Technical contact
  'executive', // Executive sponsor
  'stakeholder', // Project stakeholder
  'other',
]);

// ============================================
// Sprint/Agile Enums
// ============================================
export const sprintStatusEnum = pgEnum('sprint_status', [
  'planning', // Sprint being planned
  'active', // Currently in progress
  'completed', // Sprint finished
  'cancelled', // Sprint was cancelled
]);

// ============================================
// Milestone Enums
// ============================================
export const milestoneStatusEnum = pgEnum('milestone_status', [
  'pending', // Not started
  'in_progress', // Work has begun
  'completed', // Milestone reached
  'missed', // Deadline passed without completion
  'cancelled', // Milestone cancelled
]);

// ============================================
// Label Enums
// ============================================
export const labelScopeEnum = pgEnum('label_scope', [
  'global', // Available across all entities
  'project', // Project-specific labels
  'ticket', // Ticket-specific labels
]);
