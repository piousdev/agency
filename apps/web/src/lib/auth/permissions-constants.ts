/**
 * Permission constants for fine-grained access control
 * Format: entity:action
 *
 * This file is safe for both client and server use - it contains NO server-only imports.
 */

export const Permissions = {
  // Ticket permissions
  TICKET_CREATE: 'ticket:create',
  TICKET_EDIT: 'ticket:edit',
  TICKET_DELETE: 'ticket:delete',
  TICKET_ASSIGN: 'ticket:assign',
  TICKET_VIEW: 'ticket:view',

  // Project permissions
  PROJECT_CREATE: 'project:create',
  PROJECT_EDIT: 'project:edit',
  PROJECT_DELETE: 'project:delete',
  PROJECT_ASSIGN: 'project:assign',
  PROJECT_VIEW: 'project:view',

  // Client permissions
  CLIENT_CREATE: 'client:create',
  CLIENT_EDIT: 'client:edit',
  CLIENT_DELETE: 'client:delete',
  CLIENT_VIEW: 'client:view',

  // Label permissions
  LABEL_CREATE: 'label:create',
  LABEL_EDIT: 'label:edit',
  LABEL_DELETE: 'label:delete',
  LABEL_VIEW: 'label:view',

  // Bulk operations
  BULK_OPERATIONS: 'bulk:operations',

  // Admin permissions
  ADMIN_USERS: 'admin:users',
  ADMIN_ROLES: 'admin:roles',
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];

/**
 * Default permission sets for common roles
 */
const defaultEditorPermissions: Permission[] = [
  Permissions.TICKET_CREATE,
  Permissions.TICKET_EDIT,
  Permissions.TICKET_ASSIGN,
  Permissions.TICKET_VIEW,
  Permissions.PROJECT_CREATE,
  Permissions.PROJECT_EDIT,
  Permissions.PROJECT_ASSIGN,
  Permissions.PROJECT_VIEW,
  Permissions.CLIENT_CREATE,
  Permissions.CLIENT_EDIT,
  Permissions.CLIENT_VIEW,
  Permissions.LABEL_CREATE,
  Permissions.LABEL_EDIT,
  Permissions.LABEL_DELETE,
  Permissions.LABEL_VIEW,
  Permissions.BULK_OPERATIONS,
];

const defaultViewerPermissions: Permission[] = [
  Permissions.TICKET_VIEW,
  Permissions.PROJECT_VIEW,
  Permissions.CLIENT_VIEW,
  Permissions.LABEL_VIEW,
];

const defaultClientPermissions: Permission[] = [
  Permissions.TICKET_CREATE, // Clients can create tickets
  Permissions.TICKET_VIEW, // Only their own tickets (filtered elsewhere)
  Permissions.PROJECT_VIEW, // Only their own projects (filtered elsewhere)
];

export const DefaultRolePermissions = {
  admin: Object.values(Permissions) as Permission[], // Admin has all permissions
  editor: defaultEditorPermissions,
  viewer: defaultViewerPermissions,
  client: defaultClientPermissions,
} as const;
