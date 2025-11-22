import type { LucideIcon } from 'lucide-react';

/**
 * SKYLL Operations Platform - Navigation Structure
 *
 * This file defines the complete navigation structure for the platform,
 * including header navigation items and sidebar navigation groups.
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface NavigationItem {
  title: string;
  url?: string;
  icon?: LucideIcon | React.ComponentType;
  description?: string;
  items?: NavigationItem[];
  badge?: number;
  isActive?: boolean;
  roleGated?: string[]; // Roles that can access this item
}

export interface NavigationGroup {
  title: string;
  items: NavigationItem[];
}

// ============================================================================
// HEADER NAVIGATION
// ============================================================================

/**
 * Product Switcher
 * Switch between different Skyll products or workspaces (for multi-product ecosystem).
 */
export const productSwitcher = {
  title: 'Product Switcher',
  description: 'Switch between different Skyll products or workspaces',
};

/**
 * Global Search
 * Global search across projects, clients, issues, deliverables, content, and team members.
 */
export const globalSearch = {
  title: 'Search',
  description: 'Search across projects, clients, issues, deliverables, content, and team members',
  placeholder: 'Search...',
};

/**
 * Create Menu
 * Quick create menu with options for creating various resources.
 */
export const createMenu: NavigationItem = {
  title: 'Create',
  description: 'Quick create menu',
  items: [
    {
      title: 'New Project',
      description: 'Start a new project',
      url: '/dashboard/projects/new',
    },
    {
      title: 'New Issue',
      description: 'Create a new task/issue',
      url: '/dashboard/issues/new',
    },
    {
      title: 'New Client',
      description: 'Add a new client relationship',
      url: '/dashboard/clients/new',
    },
    {
      title: 'New Service Request',
      description: 'Submit a service request',
      url: '/dashboard/services/requests/new',
    },
    {
      title: 'New Deliverable',
      description: 'Create/upload a deliverable',
      url: '/dashboard/deliverables/new',
    },
    {
      title: 'New Document',
      description: 'Create internal documentation',
      url: '/dashboard/documents/new',
    },
    {
      title: 'New Team Member',
      description: 'Invite a user (admin only)',
      url: '/dashboard/admin/users/invite',
      roleGated: ['admin', 'owner'],
    },
  ],
};

/**
 * Notifications
 * Display alerts, updates, mentions, and activity notifications with badge count.
 */
export const notifications = {
  title: 'Notifications',
  description: 'Alerts, updates, mentions, and activity notifications',
  url: '/dashboard/notifications',
};

/**
 * Help Menu
 * Access documentation, FAQs, tutorials, and support contact options.
 */
export const helpMenu: NavigationItem = {
  title: 'Help',
  description: 'Documentation, FAQs, tutorials, and support',
  items: [
    {
      title: 'Documentation',
      url: '/dashboard/help/docs',
    },
    {
      title: 'FAQs',
      url: '/dashboard/help/faqs',
    },
    {
      title: 'Tutorials',
      url: '/dashboard/help/tutorials',
    },
    {
      title: 'Contact Support',
      url: '/dashboard/help/support',
    },
  ],
};

/**
 * Profile Menu
 * Quick access to user profile, account settings, and logout.
 */
export const profileMenu: NavigationItem = {
  title: 'Profile / Settings',
  description: 'User profile, account settings, and logout',
  items: [
    {
      title: 'My Profile',
      url: '/dashboard/profile',
    },
    {
      title: 'Account Settings',
      url: '/dashboard/settings/account',
    },
    {
      title: 'Logout',
      url: '/dashboard/logout',
    },
  ],
};

/**
 * User Menu (Profile Dropdown in Header)
 * Comprehensive user menu with profile, settings, and account management options.
 */
export const userMenu: NavigationItem = {
  title: 'User Menu',
  description: 'User profile and account management',
  items: [
    {
      title: 'View Profile',
      description: 'Quick link to profile page',
      url: '/dashboard/profile',
    },
    {
      title: 'Edit Profile',
      description: 'Update name, avatar, bio',
      url: '/dashboard/profile/edit',
    },
    {
      title: 'Account Settings',
      description: 'Email, password, contact info',
      url: '/dashboard/settings/account',
    },
    {
      title: 'Notification Preferences',
      description: 'Configure alerts and notifications',
      url: '/dashboard/settings/notifications',
    },
    {
      title: 'Display Preferences',
      description: 'Theme, language, timezone',
      url: '/dashboard/settings/display',
    },
    {
      title: 'Integrations',
      description: 'Connected apps and services',
      url: '/dashboard/settings/integrations',
    },
    {
      title: 'API Keys',
      description: 'Developer access management',
      url: '/dashboard/settings/api',
    },
    {
      title: 'Privacy & Security',
      description: 'Privacy controls, sessions, 2FA',
      url: '/dashboard/settings/security',
    },
    {
      title: 'Help & Support',
      description: 'Docs, FAQs, contact support',
      url: '/dashboard/help',
    },
    {
      title: 'Switch Organization/Workspace',
      description: 'Switch between workspaces (conditional)',
      url: '/dashboard/workspace/switch',
      // This item should be conditionally shown for multi-workspace users
    },
    {
      title: 'Invite Team Member',
      description: 'Quick invite option (optional)',
      url: '/dashboard/team/invite',
      roleGated: ['admin', 'owner'],
    },
    {
      title: 'Logout',
      description: 'Sign out',
      url: '/dashboard/logout',
    },
  ],
};

/**
 * User Menu Groups - Organized sections for better UX
 */
export const userMenuGroups = {
  profile: [
    {
      title: 'View Profile',
      description: 'Quick link to profile page',
      url: '/dashboard/profile',
    },
    {
      title: 'Edit Profile',
      description: 'Update name, avatar, bio',
      url: '/dashboard/profile/edit',
    },
  ],
  settings: [
    {
      title: 'Account Settings',
      description: 'Email, password, contact info',
      url: '/dashboard/settings/account',
    },
    {
      title: 'Notification Preferences',
      description: 'Configure alerts and notifications',
      url: '/dashboard/settings/notifications',
    },
    {
      title: 'Display Preferences',
      description: 'Theme, language, timezone',
      url: '/dashboard/settings/display',
    },
  ],
  developer: [
    {
      title: 'Integrations',
      description: 'Connected apps and services',
      url: '/dashboard/settings/integrations',
    },
    {
      title: 'API Keys',
      description: 'Developer access management',
      url: '/dashboard/settings/api',
    },
  ],
  security: [
    {
      title: 'Privacy & Security',
      description: 'Privacy controls, sessions, 2FA',
      url: '/dashboard/settings/security',
    },
  ],
  workspace: [
    {
      title: 'Switch Organization/Workspace',
      description: 'Switch between workspaces',
      url: '/dashboard/workspace/switch',
    },
    {
      title: 'Invite Team Member',
      description: 'Quick invite option',
      url: '/dashboard/team/invite',
      roleGated: ['admin', 'owner'],
    },
  ],
  support: [
    {
      title: 'Help & Support',
      description: 'Docs, FAQs, contact support',
      url: '/dashboard/help',
    },
  ],
  signout: [
    {
      title: 'Logout',
      description: 'Sign out',
      url: '/dashboard/logout',
    },
  ],
};

// ============================================================================
// SIDEBAR NAVIGATION
// ============================================================================

/**
 * WORK MANAGEMENT GROUP
 */

// Work Section
export const businessCenterNavigation: NavigationItem = {
  title: 'Business Center',
  description: 'Central hub for daily operations and overview',
  url: '/dashboard/business-center',
  items: [
    {
      title: 'Overview',
      description: 'Central hub for daily operations and overview',
      url: '/dashboard/business-center',
    },
    {
      title: 'Intake Queue',
      description: 'Manage incoming client requests',
      url: '/dashboard/business-center/intake-queue',
    },
    {
      title: 'Projects',
      description: 'Manage all projects with filters for content and software',
      url: '/dashboard/business-center/projects',
    },
    {
      title: 'Team Capacity',
      description: 'View and manage team workload',
      url: '/dashboard/business-center/team-capacity',
    },
    {
      title: 'Deliverables',
      description: 'Track project deliverables and deadlines',
      url: '/dashboard/business-center/deliverables',
    },
    {
      title: 'Recently Completed',
      description: 'Recently finished projects and tasks',
      url: '/dashboard/business-center/recently-completed',
    },
  ],
};

// Projects Section
export const projectsNavigation: NavigationItem = {
  title: 'Projects',
  description: 'Manage all projects and project lifecycle',
  url: '/dashboard/projects',
  items: [
    {
      title: 'All Projects',
      description: 'Complete list of projects',
      url: '/dashboard/projects',
    },
    {
      title: 'Active Projects',
      description: 'Currently ongoing projects',
      url: '/dashboard/projects/active',
    },
    {
      title: 'Archived Projects',
      description: 'Completed or paused projects',
      url: '/dashboard/projects/archived',
    },
    {
      title: 'By Client',
      description: 'Projects grouped by client',
      url: '/dashboard/projects/by-client',
    },
    {
      title: 'Templates',
      description: 'Reusable project templates',
      url: '/dashboard/projects/templates',
    },
    {
      title: 'Views',
      description: 'Different project visualizations',
      url: '/dashboard/projects/views',
      items: [
        {
          title: 'Board View',
          description: 'Kanban/board visualization',
          url: '/dashboard/projects/views/board',
        },
        {
          title: 'List View',
          description: 'Detailed project list',
          url: '/dashboard/projects/views/list',
        },
        {
          title: 'Calendar View',
          description: 'Timeline/calendar visualization',
          url: '/dashboard/projects/views/calendar',
        },
        {
          title: 'Timeline View',
          description: 'Gantt chart view',
          url: '/dashboard/projects/views/timeline',
        },
      ],
    },
    {
      title: 'Settings',
      description: 'Project settings and customization',
      url: '/dashboard/projects/settings',
    },
  ],
};

// Issues Section (Bug Tracking & Problem Reporting)
export const issuesNavigation: NavigationItem = {
  title: 'Issues',
  description: 'Bug tracking and problem reporting',
  url: '/dashboard/issues',
  items: [
    {
      title: 'All Issues',
      description: 'Complete issue backlog',
      url: '/dashboard/issues',
    },
    {
      title: 'Open Issues',
      description: 'Active, unresolved issues',
      url: '/dashboard/issues/open',
    },
    {
      title: 'My Issues',
      description: 'Issues assigned to current user',
      url: '/dashboard/issues/mine',
    },
    {
      title: 'By Priority',
      description: 'Issues sorted by priority level',
      url: '/dashboard/issues/by-priority',
    },
    {
      title: 'By Status',
      description: 'Issues grouped by status',
      url: '/dashboard/issues/by-status',
    },
    {
      title: 'Settings',
      description: 'Issue tracking configuration',
      url: '/dashboard/issues/settings',
    },
  ],
};

// Tasks Section (Work Items & Sprint Planning)
export const tasksNavigation: NavigationItem = {
  title: 'Tasks',
  description: 'Task management and sprint planning',
  url: '/dashboard/tasks',
  items: [
    {
      title: 'All Tasks',
      description: 'Complete task list',
      url: '/dashboard/tasks',
    },
    {
      title: 'My Tasks',
      description: 'Tasks assigned to current user',
      url: '/dashboard/tasks/mine',
    },
    {
      title: 'Backlog',
      description: 'Unscheduled tasks',
      url: '/dashboard/tasks/backlog',
    },
    {
      title: 'Sprint Board',
      description: 'Current sprint view',
      url: '/dashboard/tasks/sprint',
    },
    {
      title: 'By Priority',
      description: 'Tasks sorted by priority',
      url: '/dashboard/tasks/by-priority',
    },
    {
      title: 'By Status',
      description: 'Tasks grouped by status',
      url: '/dashboard/tasks/by-status',
    },
    {
      title: 'Settings',
      description: 'Task management configuration',
      url: '/dashboard/tasks/settings',
    },
  ],
};

// Work Management Group
export const workManagementGroup: NavigationGroup = {
  title: 'Work Management',
  items: [businessCenterNavigation, projectsNavigation, tasksNavigation, issuesNavigation],
};

/**
 * CLIENT MANAGEMENT GROUP
 */

// Clients Section
export const clientsNavigation: NavigationItem = {
  title: 'Clients',
  description: 'Relationship and account management for all clients',
  url: '/dashboard/clients',
  roleGated: ['admin', 'owner', 'manager'], // Internal team only
  items: [
    {
      title: 'All Clients',
      description: 'Complete client directory',
      url: '/dashboard/clients',
    },
    {
      title: 'Active Clients',
      description: 'Current, engaged clients',
      url: '/dashboard/clients/active',
    },
    {
      title: 'Inactive Clients',
      description: 'Dormant or archived client accounts',
      url: '/dashboard/clients/inactive',
    },
    {
      title: 'By Industry',
      description: 'Clients grouped by industry/vertical',
      url: '/dashboard/clients/by-industry',
    },
    {
      title: 'Client Directory',
      description: 'Searchable client database with details',
      url: '/dashboard/clients/directory',
    },
    {
      title: 'Contracts & Agreements',
      description: 'Client contracts and terms',
      url: '/dashboard/clients/contracts',
    },
    {
      title: 'Communication History',
      description: 'Interaction logs and notes with clients',
      url: '/dashboard/clients/communications',
    },
    {
      title: 'Settings',
      description: 'Client management preferences',
      url: '/dashboard/clients/settings',
    },
  ],
};

// Client Management Group (Internal team only)
export const clientManagementGroup: NavigationGroup = {
  title: 'Client Management',
  items: [clientsNavigation],
};

/**
 * SERVICE MANAGEMENT GROUP
 */

// Services & Requests Section
export const servicesNavigation: NavigationItem = {
  title: 'Services',
  description: 'Service catalog and offerings',
  url: '/dashboard/services',
  items: [
    {
      title: 'Service Catalog',
      description: 'Available services offered',
      url: '/dashboard/services/catalog',
    },
    {
      title: 'Active Services',
      description: 'Currently active service agreements',
      url: '/dashboard/services/active',
    },
    {
      title: 'Completed Services',
      description: 'Delivered services and history',
      url: '/dashboard/services/completed',
    },
    {
      title: 'SLA Tracking',
      description: 'Service level agreements and compliance',
      url: '/dashboard/services/sla',
    },
    {
      title: 'Settings',
      description: 'Service configuration and defaults',
      url: '/dashboard/services/settings',
    },
  ],
};

// Requests Section (Service Requests & Fulfillment)
export const requestsNavigation: NavigationItem = {
  title: 'Requests',
  description: 'Service request management and fulfillment',
  url: '/dashboard/requests',
  items: [
    {
      title: 'All Requests',
      description: 'Complete request history',
      url: '/dashboard/requests',
    },
    {
      title: 'Incoming Requests',
      description: 'New service requests awaiting review',
      url: '/dashboard/requests/incoming',
    },
    {
      title: 'In Progress',
      description: 'Requests currently being fulfilled',
      url: '/dashboard/requests/in-progress',
    },
    {
      title: 'Completed Requests',
      description: 'Fulfilled and closed requests',
      url: '/dashboard/requests/completed',
    },
    {
      title: 'My Requests',
      description: 'Requests assigned to current user',
      url: '/dashboard/requests/mine',
    },
    {
      title: 'By Status',
      description: 'Filter requests by status',
      url: '/dashboard/requests/by-status',
    },
    {
      title: 'Settings',
      description: 'Request management configuration',
      url: '/dashboard/requests/settings',
    },
  ],
};

// Service Management Group
export const serviceManagementGroup: NavigationGroup = {
  title: 'Service Management',
  items: [servicesNavigation, requestsNavigation],
};

/**
 * COLLABORATION & CONTENT GROUP
 */

// Collaboration Section
export const collaborationNavigation: NavigationItem = {
  title: 'Collaboration',
  description: 'Team communication and collaboration tools',
  url: '/dashboard/collaboration',
  items: [
    {
      title: 'Teams',
      description: 'List of teams and team directories',
      url: '/dashboard/collaboration/teams',
    },
    {
      title: 'Channels',
      description: 'Communication channels by project or topic',
      url: '/dashboard/collaboration/channels',
    },
    {
      title: 'Direct Messages',
      description: 'Private team communications',
      url: '/dashboard/collaboration/messages',
    },
    {
      title: 'Shared Workspaces',
      description: 'Collaborative work areas',
      url: '/dashboard/collaboration/workspaces',
    },
    {
      title: 'Mentions',
      description: 'Messages mentioning current user',
      url: '/dashboard/collaboration/mentions',
    },
    {
      title: 'Activity Feed',
      description: 'Team activity and updates',
      url: '/dashboard/collaboration/feed',
    },
    {
      title: 'Settings',
      description: 'Collaboration preferences',
      url: '/dashboard/collaboration/settings',
    },
  ],
};

// Content & Deliverables Section
export const contentNavigation: NavigationItem = {
  title: 'Content & Deliverables',
  description: 'Manage project outputs and asset management',
  url: '/dashboard/content',
  items: [
    {
      title: 'All Deliverables',
      description: 'Complete deliverables library',
      url: '/dashboard/content/deliverables',
    },
    {
      title: 'Pending Deliverables',
      description: 'Items awaiting review or delivery',
      url: '/dashboard/content/deliverables/pending',
    },
    {
      title: 'Completed Deliverables',
      description: 'Delivered and archived deliverables',
      url: '/dashboard/content/deliverables/completed',
    },
    {
      title: 'By Client',
      description: 'Deliverables grouped by client',
      url: '/dashboard/content/deliverables/by-client',
    },
    {
      title: 'By Project',
      description: 'Deliverables grouped by project',
      url: '/dashboard/content/deliverables/by-project',
    },
    {
      title: 'Content Library',
      description: 'Centralized content repository',
      url: '/dashboard/content/library',
    },
    {
      title: 'Asset Management',
      description: 'Media files, images, documents',
      url: '/dashboard/content/assets',
    },
    {
      title: 'Templates',
      description: 'Reusable content and deliverable templates',
      url: '/dashboard/content/templates',
    },
    {
      title: 'Approvals',
      description: 'Items pending approval or review',
      url: '/dashboard/content/approvals',
    },
    {
      title: 'Settings',
      description: 'Content management settings',
      url: '/dashboard/content/settings',
    },
  ],
};

// Collaboration & Content Group
export const collaborationContentGroup: NavigationGroup = {
  title: 'Collaboration & Content',
  items: [collaborationNavigation, contentNavigation],
};

/**
 * INSIGHTS & ADMINISTRATION GROUP
 */

// Analytics & Reporting Section
export const analyticsNavigation: NavigationItem = {
  title: 'Analytics & Reporting',
  description: 'Data-driven insights and performance tracking',
  url: '/dashboard/analytics',
  items: [
    {
      title: 'Dashboards',
      description: 'Custom analytics dashboards',
      url: '/dashboard/analytics/dashboards',
    },
    {
      title: 'Reports',
      description: 'Generated reports and insights',
      url: '/dashboard/analytics/reports',
    },
    {
      title: 'Team Performance',
      description: 'Team productivity and metrics',
      url: '/dashboard/analytics/team',
    },
    {
      title: 'Client Performance',
      description: 'Client engagement and satisfaction metrics',
      url: '/dashboard/analytics/clients',
    },
    {
      title: 'Project Metrics',
      description: 'Project success rates, timelines, budgets',
      url: '/dashboard/analytics/projects',
    },
    {
      title: 'Service Metrics',
      description: 'Service delivery and SLA performance',
      url: '/dashboard/analytics/services',
    },
    {
      title: 'Financial Reports',
      description: 'Revenue, billing, and cost tracking',
      url: '/dashboard/analytics/financial',
    },
    {
      title: 'Export',
      description: 'Download reports and data',
      url: '/dashboard/analytics/export',
    },
    {
      title: 'Settings',
      description: 'Report customization',
      url: '/dashboard/analytics/settings',
    },
  ],
};

// Admin Panel Section (Role-Gated)
export const adminNavigation: NavigationItem = {
  title: 'Admin Panel',
  description: 'System administration and organization management',
  url: '/dashboard/admin',
  roleGated: ['admin', 'owner'],
  items: [
    {
      title: 'Users & Permissions',
      description: 'User management, roles, and access control',
      url: '/dashboard/admin/users',
    },
    {
      title: 'Team Management',
      description: 'Team structure and assignments',
      url: '/dashboard/admin/teams',
    },
    {
      title: 'Billing & Invoicing',
      description: 'Payment management and invoicing',
      url: '/dashboard/admin/billing',
    },
    {
      title: 'Integrations',
      description: 'Third-party integrations and APIs',
      url: '/dashboard/admin/integrations',
    },
    {
      title: 'Workflows & Automation',
      description: 'Automation rules and workflows',
      url: '/dashboard/admin/workflows',
    },
    {
      title: 'Organization Settings',
      description: 'Company-wide configuration',
      url: '/dashboard/admin/organization',
    },
    {
      title: 'Security & Compliance',
      description: 'Security policies and audit logs',
      url: '/dashboard/admin/security',
    },
    {
      title: 'Data Management',
      description: 'Backup, export, and data management',
      url: '/dashboard/admin/data',
    },
    {
      title: 'Settings',
      description: 'Admin preferences',
      url: '/dashboard/admin/settings',
    },
  ],
};

// Settings Section
export const settingsNavigation: NavigationItem = {
  title: 'Settings',
  description: 'User and account preferences',
  url: '/dashboard/settings',
};

// Profile Section
export const profileNavigation: NavigationItem = {
  title: 'Profile',
  description: 'User profile and account information',
  url: '/dashboard/profile',
  items: [
    {
      title: 'My Profile',
      description: 'View/edit personal profile',
      url: '/dashboard/profile',
    },
    {
      title: 'Account Details',
      description: 'Email, phone, contact information',
      url: '/dashboard/profile/details',
    },
    {
      title: 'Avatar & Bio',
      description: 'Profile picture and biography',
      url: '/dashboard/profile/avatar',
    },
    {
      title: 'Activity History',
      description: 'Personal activity log',
      url: '/dashboard/profile/activity',
    },
    {
      title: 'Preferences',
      description: 'Personal user preferences',
      url: '/dashboard/profile/preferences',
    },
    {
      title: 'Logout',
      description: 'Sign out',
      url: '/dashboard/logout',
    },
  ],
};

// Search Section (Opens Command Palette)
export const searchNavigation: NavigationItem = {
  title: 'Search',
  description: 'Global search (⌘K)',
  url: '#search', // Special URL to trigger command palette
};

// Help & Support Section
export const helpNavigation: NavigationItem = {
  title: 'Get Help',
  description: 'Documentation and support resources',
  url: '/dashboard/help',
};

// Changelog Section
export const changelogNavigation: NavigationItem = {
  title: 'Changelog',
  description: 'Release history and platform updates',
  url: '/dashboard/changelog',
};

// Insights Group (Analytics & Reporting)
export const insightsGroup: NavigationGroup = {
  title: 'Insights',
  items: [analyticsNavigation],
};

// Administration Group (Admin Panel - Role Gated)
export const administrationGroup: NavigationGroup = {
  title: 'Administration',
  items: [adminNavigation],
};

// General Group (Settings, Search, Help, Changelog)
export const generalGroup: NavigationGroup = {
  title: 'General',
  items: [settingsNavigation, searchNavigation, helpNavigation, changelogNavigation],
};

// ============================================================================
// COMPLETE NAVIGATION STRUCTURE
// ============================================================================

/**
 * Complete sidebar navigation structure organized by groups
 */
export const sidebarNavigation: NavigationGroup[] = [
  workManagementGroup,
  clientManagementGroup,
  serviceManagementGroup,
  collaborationContentGroup,
  insightsGroup,
  administrationGroup,
  generalGroup,
];

/**
 * Complete header navigation items
 */
export const headerNavigation = {
  productSwitcher,
  globalSearch,
  createMenu,
  notifications,
  helpMenu,
  profileMenu,
  userMenu,
  userMenuGroups,
};
