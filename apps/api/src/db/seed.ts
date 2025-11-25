/**
 * Business Center Seed Script
 * Populates comprehensive test data for all Business Center scenarios
 */

import 'dotenv/config';
import { db } from './index.js';
import {
  client,
  user,
  ticket,
  project,
  projectAssignment,
  userToClient,
  role,
  roleAssignment,
  sprint,
  request,
  requestHistory,
  userDashboardPreferences,
} from './schema/index.js';
import type { WidgetLayout } from './schema/dashboard-preferences.js';
import { eq, ne } from 'drizzle-orm';
import { nanoid } from 'nanoid';

/**
 * Default Role Permissions
 * Converted from apps/web/src/lib/auth/permissions.ts for seeding
 */
const Permissions = {
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
  // Bulk operations
  BULK_OPERATIONS: 'bulk:operations',
  // Admin permissions
  ADMIN_USERS: 'admin:users',
  ADMIN_ROLES: 'admin:roles',
} as const;

const allPermissions = Object.values(Permissions);

const editorPermissions = [
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
  Permissions.BULK_OPERATIONS,
];

const viewerPermissions = [
  Permissions.TICKET_VIEW,
  Permissions.PROJECT_VIEW,
  Permissions.CLIENT_VIEW,
];

const clientPermissions = [
  Permissions.TICKET_CREATE,
  Permissions.TICKET_VIEW,
  Permissions.PROJECT_VIEW,
];

/**
 * Convert permission array to Record<string, boolean>
 */
function permissionsToRecord(perms: string[]): Record<string, boolean> {
  return perms.reduce(
    (acc, perm) => {
      acc[perm] = true;
      return acc;
    },
    {} as Record<string, boolean>
  );
}

/**
 * Seed configuration
 */
const SEED_CONFIG = {
  // Users
  internalUsers: 6, // Team members
  clientUsers: 4, // Client users

  // Clients
  creativeClients: 3,
  softwareClients: 2,
  fullServiceClients: 1,

  // Tickets
  intakeTicketsUnassigned: 5,
  intakeTicketsAssigned: 3,

  // Projects
  creativeProjectsPreProd: 2,
  creativeProjectsInProd: 3,
  creativeProjectsPostProd: 2,
  softwareProjectsDesign: 1,
  softwareProjectsDev: 3,
  softwareProjectsTesting: 2,
  softwareProjectsDelivery: 1,
  completedProjects: 4,

  // Delivery dates (days from now)
  upcomingDeliveries: [3, 7, 7, 14, 21], // Multiple deliveries on day 7
};

/**
 * Clear existing data (preserves admin user)
 */
async function clearData() {
  console.log('🗑️  Clearing existing data...');

  const adminEmail = process.env.ADMIN_EMAIL;

  await db.delete(requestHistory);
  await db.delete(request);
  await db.delete(projectAssignment);
  await db.delete(ticket);
  await db.delete(project);
  await db.delete(userToClient);
  await db.delete(client);
  await db.delete(roleAssignment);
  await db.delete(userDashboardPreferences);

  // Delete all users EXCEPT the admin
  if (adminEmail) {
    await db.delete(user).where(ne(user.email, adminEmail));
    console.log(`✅ Data cleared (preserved admin: ${adminEmail})\n`);
  } else {
    await db.delete(user);
    console.log('⚠️  Warning: No ADMIN_EMAIL found, deleted all users\n');
  }
}

/**
 * Seed Default Roles
 */
async function seedRoles() {
  console.log('🎭 Seeding roles...');

  // Clear existing roles first
  await db.delete(role);

  const defaultRoles = [
    {
      id: nanoid(),
      name: 'admin',
      description: 'Full system access with all permissions',
      permissions: permissionsToRecord(allPermissions),
      roleType: 'internal',
    },
    {
      id: nanoid(),
      name: 'editor',
      description: 'Can create, edit, and manage tickets, projects, and clients',
      permissions: permissionsToRecord(editorPermissions),
      roleType: 'internal',
    },
    {
      id: nanoid(),
      name: 'viewer',
      description: 'Read-only access to tickets, projects, and clients',
      permissions: permissionsToRecord(viewerPermissions),
      roleType: 'internal',
    },
    {
      id: nanoid(),
      name: 'client',
      description: 'Client user with limited access to own tickets and projects',
      permissions: permissionsToRecord(clientPermissions),
      roleType: 'client',
    },
  ];

  const createdRoles: Record<string, string> = {};

  for (const roleData of defaultRoles) {
    const [newRole] = await db.insert(role).values(roleData).returning();
    if (newRole) {
      createdRoles[roleData.name] = newRole.id;
    }
  }

  console.log(
    `✅ Created ${Object.keys(createdRoles).length} default roles (admin, editor, viewer, client)\n`
  );

  return createdRoles;
}

/**
 * Seed Role Assignments
 */
async function seedRoleAssignments(
  internalUsers: any[],
  clientUsers: any[],
  roles: Record<string, string>
) {
  console.log('🔐 Seeding role assignments...');

  let assignmentCount = 0;

  // Assign editor role to all internal users
  const editorRoleId = roles['editor'];
  if (editorRoleId) {
    for (const internalUser of internalUsers) {
      await db.insert(roleAssignment).values({
        id: nanoid(),
        userId: internalUser.id,
        roleId: editorRoleId,
        assignedAt: new Date(),
      });
      assignmentCount++;
    }
  }

  // Assign client role to all client users
  const clientRoleId = roles['client'];
  if (clientRoleId) {
    for (const clientUser of clientUsers) {
      await db.insert(roleAssignment).values({
        id: nanoid(),
        userId: clientUser.id,
        roleId: clientRoleId,
        assignedAt: new Date(),
      });
      assignmentCount++;
    }
  }

  // Assign admin role to the admin user if exists
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminRoleId = roles['admin'];
  if (adminEmail && adminRoleId) {
    const [adminUser] = await db.select().from(user).where(eq(user.email, adminEmail));
    if (adminUser) {
      await db.insert(roleAssignment).values({
        id: nanoid(),
        userId: adminUser.id,
        roleId: adminRoleId,
        assignedAt: new Date(),
      });
      assignmentCount++;
      console.log(`   → Assigned admin role to ${adminEmail}`);
    }
  }

  console.log(`✅ Created ${assignmentCount} role assignments\n`);
}

/**
 * Generate realistic names
 */
const firstNames = [
  'Emma',
  'Liam',
  'Olivia',
  'Noah',
  'Ava',
  'Ethan',
  'Sophia',
  'Mason',
  'Isabella',
  'William',
];
const lastNames = [
  'Smith',
  'Johnson',
  'Williams',
  'Brown',
  'Jones',
  'Garcia',
  'Miller',
  'Davis',
  'Rodriguez',
  'Martinez',
];

function generateName() {
  const first = firstNames[Math.floor(Math.random() * firstNames.length)];
  const last = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${first} ${last}`;
}

function generateEmail(name: string, index: number) {
  const timestamp = Date.now();
  return name.toLowerCase().replace(' ', '.') + `.${timestamp}.${index}@example.com`;
}

/**
 * Seed Users
 */
async function seedUsers() {
  console.log('👥 Seeding users...');

  const users: any[] = [];

  // Internal team members (with BetterAuth fields)
  for (let i = 0; i < SEED_CONFIG.internalUsers; i++) {
    const name = generateName();
    const email = generateEmail(name, i);

    const [newUser] = await db
      .insert(user)
      .values({
        id: nanoid(),
        name,
        email,
        emailVerified: true,
        isInternal: true,
        capacityPercentage: [50, 75, 85, 100, 120, 150][i] || 80, // Varied capacities
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    users.push(newUser);
  }

  // Client users
  for (let i = 0; i < SEED_CONFIG.clientUsers; i++) {
    const name = generateName();
    const email = generateEmail(name, SEED_CONFIG.internalUsers + i);

    const [newUser] = await db
      .insert(user)
      .values({
        id: nanoid(),
        name,
        email,
        emailVerified: true,
        isInternal: false,
        capacityPercentage: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    users.push(newUser);
  }

  console.log(
    `✅ Created ${users.length} users (${SEED_CONFIG.internalUsers} internal, ${SEED_CONFIG.clientUsers} clients)\n`
  );

  return {
    internalUsers: users.slice(0, SEED_CONFIG.internalUsers),
    clientUsers: users.slice(SEED_CONFIG.internalUsers),
  };
}

/**
 * Seed Clients (companies)
 */
async function seedClients(clientUsers: any[]) {
  console.log('🏢 Seeding clients...');

  const clients: any[] = [];
  const companyNames = [
    'Acme Studios',
    'Creative Co',
    'Media Masters',
    'Tech Innovations',
    'Digital Solutions',
    'Full Stack Agency',
  ];

  let userIndex = 0;

  // Creative clients
  for (let i = 0; i < SEED_CONFIG.creativeClients; i++) {
    const companyName = companyNames[i]!;
    const [newClient] = await db
      .insert(client)
      .values({
        id: nanoid(),
        name: companyName,
        type: 'creative',
        email: `contact@${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Link client user
    const clientUser = clientUsers[userIndex];
    if (clientUser && newClient) {
      await db.insert(userToClient).values({
        id: nanoid(),
        userId: clientUser.id,
        clientId: newClient.id,
      });
      userIndex++;
    }

    if (newClient) clients.push(newClient);
  }

  // Software clients
  for (let i = 0; i < SEED_CONFIG.softwareClients; i++) {
    const companyName = companyNames[SEED_CONFIG.creativeClients + i]!;
    const [newClient] = await db
      .insert(client)
      .values({
        id: nanoid(),
        name: companyName,
        type: 'software',
        email: `contact@${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    const clientUser = clientUsers[userIndex];
    if (clientUser && newClient) {
      await db.insert(userToClient).values({
        id: nanoid(),
        userId: clientUser.id,
        clientId: newClient.id,
      });
      userIndex++;
    }

    if (newClient) clients.push(newClient);
  }

  // Full-service clients
  for (let i = 0; i < SEED_CONFIG.fullServiceClients; i++) {
    const companyName =
      companyNames[SEED_CONFIG.creativeClients + SEED_CONFIG.softwareClients + i]!;
    const [newClient] = await db
      .insert(client)
      .values({
        id: nanoid(),
        name: companyName,
        type: 'full_service',
        email: `contact@${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    const clientUser = clientUsers[userIndex];
    if (clientUser && newClient) {
      await db.insert(userToClient).values({
        id: nanoid(),
        userId: clientUser.id,
        clientId: newClient.id,
      });
      userIndex++;
    }

    if (newClient) clients.push(newClient);
  }

  console.log(`✅ Created ${clients.length} clients\n`);

  return {
    creativeClients: clients.slice(0, SEED_CONFIG.creativeClients),
    softwareClients: clients.slice(
      SEED_CONFIG.creativeClients,
      SEED_CONFIG.creativeClients + SEED_CONFIG.softwareClients
    ),
    fullServiceClients: clients.slice(SEED_CONFIG.creativeClients + SEED_CONFIG.softwareClients),
  };
}

/**
 * Seed Tickets
 */
async function seedTickets(clients: any[], internalUsers: any[]) {
  console.log('🎫 Seeding tickets...');

  const tickets: any[] = [];
  const priorities = ['low', 'medium', 'high', 'critical'];
  const ticketTitles = [
    'New campaign creative needed',
    'Website redesign request',
    'Logo design update',
    'Social media content package',
    'Video editing project',
    'Brand guidelines development',
    'Marketing materials',
    'Product photography',
  ];

  // Get admin user to assign tickets to them
  const adminEmail = process.env.ADMIN_EMAIL;
  let adminUser = null;
  if (adminEmail) {
    const [foundAdmin] = await db.select().from(user).where(eq(user.email, adminEmail));
    adminUser = foundAdmin;
  }

  // Unassigned intake tickets
  for (let i = 0; i < SEED_CONFIG.intakeTicketsUnassigned; i++) {
    const ticketTitle = ticketTitles[i % ticketTitles.length]!;
    const clientForTicket = clients[i % clients.length]!;
    const creatorUser = internalUsers[0]!;
    const [newTicket] = await db
      .insert(ticket)
      .values({
        id: nanoid(),
        title: ticketTitle,
        description: `Detailed description for ${ticketTitle}. This is a comprehensive request that needs review.`,
        type: 'intake',
        status: 'open',
        priority: priorities[i % priorities.length] as 'low' | 'medium' | 'high' | 'critical',
        clientId: clientForTicket.id,
        createdById: creatorUser.id,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last week
        updatedAt: new Date(),
      })
      .returning();

    if (newTicket) tickets.push(newTicket);
  }

  // Assigned intake tickets
  for (let i = 0; i < SEED_CONFIG.intakeTicketsAssigned; i++) {
    const ticketTitle =
      ticketTitles[(SEED_CONFIG.intakeTicketsUnassigned + i) % ticketTitles.length]!;
    const clientForTicket = clients[i % clients.length]!;
    const assignee = internalUsers[i % internalUsers.length]!;
    const creatorUser = internalUsers[0]!;
    const [newTicket] = await db
      .insert(ticket)
      .values({
        id: nanoid(),
        title: ticketTitle,
        description: `This ticket has been assigned and is being worked on.`,
        type: 'intake',
        status: 'in_progress',
        priority: priorities[(i + 1) % priorities.length] as 'low' | 'medium' | 'high' | 'critical',
        clientId: clientForTicket.id,
        assignedToId: assignee.id,
        createdById: creatorUser.id,
        createdAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      })
      .returning();

    if (newTicket) tickets.push(newTicket);
  }

  // Create tickets assigned to admin user with due dates (for "My Work Today" and "Upcoming Deadlines")
  if (adminUser) {
    const adminTaskTitles = [
      'Review Q4 marketing strategy',
      'Finalize client proposal',
      'Update project documentation',
      'Code review for feature branch',
      'Prepare weekly status report',
      'Sprint planning meeting prep',
      'Client feedback implementation',
      'Bug fix: Login page issue',
    ];

    const dueDates = [
      new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
      new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
      new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
      new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
      new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
      null, // No due date
    ];

    console.log(`   → Creating tasks assigned to admin: ${adminEmail}`);

    for (let i = 0; i < adminTaskTitles.length; i++) {
      const status = i < 3 ? 'in_progress' : 'open';
      const [newTicket] = await db
        .insert(ticket)
        .values({
          id: nanoid(),
          title: adminTaskTitles[i]!,
          description: `Admin task: ${adminTaskTitles[i]}. This task needs attention.`,
          type: 'task',
          status,
          priority: priorities[i % priorities.length] as 'low' | 'medium' | 'high' | 'critical',
          clientId: clients[i % clients.length]!.id,
          assignedToId: adminUser.id,
          createdById: adminUser.id,
          dueAt: dueDates[i] ?? null,
          createdAt: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
        })
        .returning();

      if (newTicket) tickets.push(newTicket);
    }
  }

  console.log(
    `✅ Created ${tickets.length} tickets (${SEED_CONFIG.intakeTicketsUnassigned} unassigned, ${SEED_CONFIG.intakeTicketsAssigned} assigned${adminUser ? ', 8 admin tasks' : ''})\n`
  );

  return tickets;
}

/**
 * Seed Projects
 */
async function seedProjects(clients: any[], internalUsers: any[]) {
  console.log('📁 Seeding projects...');

  const projects: any[] = [];
  const projectNames = [
    'Q4 Marketing Campaign',
    'Brand Refresh Initiative',
    'Social Media Strategy',
    'Web Platform Redesign',
    'Mobile App Development',
    'E-commerce Integration',
    'Customer Portal',
    'Analytics Dashboard',
    'Product Launch Campaign',
    'Annual Report Design',
    'Corporate Video Production',
    'Email Marketing Automation',
    'SEO Optimization Project',
    'Content Management System',
    'Inventory Management Tool',
    'Client Onboarding Portal',
    'Payment Gateway Integration',
    'Performance Monitoring Dashboard',
    'API Documentation Site',
    'Training Platform Upgrade',
    'Security Audit Implementation',
    'Cloud Migration Project',
    'Mobile Responsive Update',
    'Multi-language Support',
    'Accessibility Compliance',
  ];

  let nameIndex = 0;

  // Creative Projects - Pre-Production (proposal or early dev <30%)
  for (let i = 0; i < SEED_CONFIG.creativeProjectsPreProd; i++) {
    const projectName = projectNames[nameIndex++]!;
    const clientForProject = clients[i % SEED_CONFIG.creativeClients]!;
    const [newProject] = await db
      .insert(project)
      .values({
        id: nanoid(),
        name: projectName,
        description: 'Creative project in pre-production phase',
        status: i % 2 === 0 ? 'proposal' : 'in_development',
        clientId: clientForProject.id,
        completionPercentage: i % 2 === 0 ? 0 : Math.floor(Math.random() * 30),
        priority: 'medium',
        deliveredAt: null,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      })
      .returning();

    if (newProject) projects.push(newProject);
  }

  // Creative Projects - In-Production (30-79%) with scheduled deliveries
  for (let i = 0; i < SEED_CONFIG.creativeProjectsInProd; i++) {
    const projectName = projectNames[nameIndex++]!;
    const clientForProject = clients[i % SEED_CONFIG.creativeClients]!;
    // Schedule deliveries: 5, 10, 15 days from now
    const deliveryDaysFromNow = (i + 1) * 5;
    const deliveryDate = new Date(Date.now() + deliveryDaysFromNow * 24 * 60 * 60 * 1000);

    const [newProject] = await db
      .insert(project)
      .values({
        id: nanoid(),
        name: projectName,
        description: 'Creative project in active production',
        status: 'in_development',
        clientId: clientForProject.id,
        completionPercentage: 30 + Math.floor(Math.random() * 50), // 30-79%
        priority: 'high',
        deliveredAt: deliveryDate,
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      })
      .returning();

    if (newProject) projects.push(newProject);
  }

  // Creative Projects - Post-Production (in_review or >=80%)
  for (let i = 0; i < SEED_CONFIG.creativeProjectsPostProd; i++) {
    const projectName = projectNames[nameIndex++]!;
    const clientForProject = clients[i % SEED_CONFIG.creativeClients]!;
    const [newProject] = await db
      .insert(project)
      .values({
        id: nanoid(),
        name: projectName,
        description: 'Creative project in post-production',
        status: i % 2 === 0 ? 'in_review' : 'in_development',
        clientId: clientForProject.id,
        completionPercentage: i % 2 === 0 ? 75 : 80 + Math.floor(Math.random() * 20),
        priority: 'medium',
        deliveredAt: null,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      })
      .returning();

    if (newProject) projects.push(newProject);
  }

  // Software Projects - Design
  for (let i = 0; i < SEED_CONFIG.softwareProjectsDesign; i++) {
    const projectName = projectNames[nameIndex++]!;
    const clientForProject =
      clients[SEED_CONFIG.creativeClients + (i % SEED_CONFIG.softwareClients)]!;
    const [newProject] = await db
      .insert(project)
      .values({
        id: nanoid(),
        name: projectName,
        description: 'Software project in design phase',
        status: 'proposal',
        clientId: clientForProject.id,
        completionPercentage: Math.floor(Math.random() * 20),
        priority: 'medium',
        deliveredAt: null,
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      })
      .returning();

    if (newProject) projects.push(newProject);
  }

  // Software Projects - Development with scheduled deliveries
  for (let i = 0; i < SEED_CONFIG.softwareProjectsDev; i++) {
    // Schedule deliveries: 7, 14, 21 days from now
    const deliveryDaysFromNow = (i + 1) * 7;
    const deliveryDate = new Date(Date.now() + deliveryDaysFromNow * 24 * 60 * 60 * 1000);
    const projectName = projectNames[nameIndex++]!;
    const clientForProject =
      clients[SEED_CONFIG.creativeClients + (i % SEED_CONFIG.softwareClients)]!;

    const [newProject] = await db
      .insert(project)
      .values({
        id: nanoid(),
        name: projectName,
        description: 'Software project in development',
        status: 'in_development',
        clientId: clientForProject.id,
        completionPercentage: 20 + Math.floor(Math.random() * 40), // 20-59%
        priority: 'high',
        deliveredAt: deliveryDate,
        createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      })
      .returning();

    if (newProject) projects.push(newProject);
  }

  // Software Projects - Testing
  for (let i = 0; i < SEED_CONFIG.softwareProjectsTesting; i++) {
    const projectName = projectNames[nameIndex++]!;
    const clientForProject =
      clients[SEED_CONFIG.creativeClients + (i % SEED_CONFIG.softwareClients)]!;
    const [newProject] = await db
      .insert(project)
      .values({
        id: nanoid(),
        name: projectName,
        description: 'Software project in testing',
        status: 'in_development',
        clientId: clientForProject.id,
        completionPercentage: 60 + Math.floor(Math.random() * 20), // 60-79%
        priority: 'medium',
        deliveredAt: null,
        createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      })
      .returning();

    if (newProject) projects.push(newProject);
  }

  // Software Projects - Delivery
  for (let i = 0; i < SEED_CONFIG.softwareProjectsDelivery; i++) {
    const projectName = projectNames[nameIndex++]!;
    const clientForProject =
      clients[SEED_CONFIG.creativeClients + (i % SEED_CONFIG.softwareClients)]!;
    const [newProject] = await db
      .insert(project)
      .values({
        id: nanoid(),
        name: projectName,
        description: 'Software project ready for delivery',
        status: 'in_review',
        clientId: clientForProject.id,
        completionPercentage: 80 + Math.floor(Math.random() * 20), // 80-99%
        priority: 'medium',
        deliveredAt: null,
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      })
      .returning();

    if (newProject) projects.push(newProject);
  }

  // Completed Projects (last 14 days)
  for (let i = 0; i < SEED_CONFIG.completedProjects; i++) {
    const daysAgo = Math.floor(Math.random() * 14); // 0-13 days ago
    const deliveryDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    const projectName = projectNames[nameIndex++ % projectNames.length]!;
    const clientForProject = clients[i % clients.length]!;

    const [newProject] = await db
      .insert(project)
      .values({
        id: nanoid(),
        name: `Completed ${projectName}`,
        description: 'Recently completed project',
        status: 'delivered',
        clientId: clientForProject.id,
        completionPercentage: 100,
        priority: 'high',
        deliveredAt: deliveryDate,
        createdAt: new Date(deliveryDate.getTime() - 60 * 24 * 60 * 60 * 1000),
        updatedAt: deliveryDate,
      })
      .returning();

    if (newProject) projects.push(newProject);
  }

  // Projects with upcoming deliveries
  for (let i = 0; i < SEED_CONFIG.upcomingDeliveries.length; i++) {
    const daysUntilDelivery = SEED_CONFIG.upcomingDeliveries[i]!;
    const deliveryDate = new Date(Date.now() + daysUntilDelivery * 24 * 60 * 60 * 1000);
    const projectName = projectNames[nameIndex++ % projectNames.length]!;
    const clientForProject = clients[i % clients.length]!;

    const [newProject] = await db
      .insert(project)
      .values({
        id: nanoid(),
        name: `Upcoming Delivery - ${projectName}`,
        description: 'Project with scheduled delivery',
        status: 'in_review',
        clientId: clientForProject.id,
        completionPercentage: 90 + Math.floor(Math.random() * 10),
        priority: 'high',
        deliveredAt: deliveryDate,
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      })
      .returning();

    if (newProject) projects.push(newProject);
  }

  console.log(`✅ Created ${projects.length} projects\n`);

  return projects;
}

/**
 * Seed Project Assignments
 */
async function seedProjectAssignments(projects: any[], internalUsers: any[]) {
  console.log('🔗 Seeding project assignments...');

  let assignmentCount = 0;

  // Assign team members to active projects (not completed)
  const activeProjects = projects.filter((p) => p.status !== 'delivered');

  for (const project of activeProjects) {
    // Randomly assign 1-3 team members to each project
    const numAssignees = 1 + Math.floor(Math.random() * 3);
    const shuffled = [...internalUsers].sort(() => 0.5 - Math.random());
    const assignees = shuffled.slice(0, numAssignees);

    for (const assignee of assignees) {
      await db.insert(projectAssignment).values({
        id: nanoid(),
        projectId: project.id,
        userId: assignee.id,
        assignedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      });

      assignmentCount++;
    }
  }

  console.log(`✅ Created ${assignmentCount} project assignments\n`);
}

/**
 * Seed Sprints for active projects
 */
async function seedSprints(projects: any[]) {
  console.log('🏃 Seeding sprints...');

  const sprints: any[] = [];
  const now = new Date();

  // Get active software projects for sprints (in_development status)
  const activeProjects = projects.filter(
    (p) => p.status === 'in_development' || p.status === 'in_review'
  );

  const sprintGoals = [
    'Complete MVP features and basic UI',
    'Implement user authentication and authorization',
    'Add reporting and analytics features',
    'Performance optimization and bug fixes',
    'Integration testing and documentation',
    'UI/UX improvements and accessibility',
    'API endpoints and data validation',
    'Mobile responsiveness and cross-browser testing',
  ];

  for (const proj of activeProjects.slice(0, 8)) {
    // Create past completed sprints
    for (let i = 1; i <= 3; i++) {
      const startDate = new Date(now.getTime() - (4 - i) * 14 * 24 * 60 * 60 * 1000);
      const endDate = new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000);
      const plannedPoints = 20 + Math.floor(Math.random() * 15);
      const completedPoints = plannedPoints - Math.floor(Math.random() * 5);

      const [newSprint] = await db
        .insert(sprint)
        .values({
          id: nanoid(),
          projectId: proj.id,
          name: `Sprint ${i}`,
          goal: sprintGoals[(i - 1) % sprintGoals.length],
          status: 'completed',
          startDate,
          endDate,
          plannedPoints,
          completedPoints,
          sprintNumber: i,
          createdAt: startDate,
          updatedAt: endDate,
        })
        .returning();

      if (newSprint) sprints.push(newSprint);
    }

    // Create current active sprint
    const activeStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const activeEndDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const plannedPoints = 25 + Math.floor(Math.random() * 10);
    const completedPoints = Math.floor(plannedPoints * (0.4 + Math.random() * 0.3));

    const [activeSprint] = await db
      .insert(sprint)
      .values({
        id: nanoid(),
        projectId: proj.id,
        name: `Sprint 4`,
        goal: sprintGoals[3],
        status: 'active',
        startDate: activeStartDate,
        endDate: activeEndDate,
        plannedPoints,
        completedPoints,
        sprintNumber: 4,
        createdAt: activeStartDate,
        updatedAt: now,
      })
      .returning();

    if (activeSprint) sprints.push(activeSprint);

    // Create upcoming planning sprint
    const planningStartDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const planningEndDate = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000);

    const [planningSprint] = await db
      .insert(sprint)
      .values({
        id: nanoid(),
        projectId: proj.id,
        name: `Sprint 5`,
        goal: sprintGoals[4],
        status: 'planning',
        startDate: planningStartDate,
        endDate: planningEndDate,
        plannedPoints: 0,
        completedPoints: 0,
        sprintNumber: 5,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    if (planningSprint) sprints.push(planningSprint);
  }

  console.log(`✅ Created ${sprints.length} sprints\n`);
  return sprints;
}

/**
 * Seed Requests (Intake Pipeline)
 */
async function seedRequests(clients: any[], internalUsers: any[]) {
  console.log('📋 Seeding intake requests...');

  const requests: any[] = [];
  const now = new Date();

  const requestTitles = {
    feature: [
      'Add dark mode support across the application',
      'Implement real-time notifications for project updates',
      'Create custom dashboard widgets for analytics',
      'Add bulk export functionality for reports',
      'Integrate Slack workspace for team notifications',
      'Implement SSO authentication via SAML',
      'Add multi-language support (i18n)',
      'Create API documentation portal',
    ],
    bug: [
      'Login page crashes on mobile Safari',
      'Data not saving correctly in project settings',
      'Email notifications sent multiple times',
      'Search results show incorrect pagination',
      'File upload fails for files over 10MB',
      'Dashboard charts not loading on Firefox',
    ],
    enhancement: [
      'Improve loading performance on dashboard',
      'Optimize image compression for uploads',
      'Enhance search functionality with filters',
      'Refactor notification system for better reliability',
      'Upgrade dependencies to latest versions',
    ],
    change_request: [
      'Update branding colors per new guidelines',
      'Modify user permissions structure',
      'Change default sort order in project list',
      'Update email templates with new design',
    ],
    support: [
      'Need help configuring webhook integrations',
      'Training request for new team members',
      'Questions about API rate limiting policies',
    ],
  };

  const priorities = ['low', 'medium', 'high', 'critical'] as const;
  const stages = ['in_treatment', 'on_hold', 'estimation', 'ready'] as const;
  const confidences = ['low', 'medium', 'high'] as const;
  const storyPoints = [1, 2, 3, 5, 8, 13, 21];

  let requestNumber = 1;

  // Helper to create a request
  const createRequest = async (config: {
    title: string;
    type: 'feature' | 'bug' | 'enhancement' | 'change_request' | 'support' | 'other';
    stage: (typeof stages)[number];
    priority: (typeof priorities)[number];
    client: any;
    requester: any;
    assignedPm?: any;
    estimator?: any;
    daysAgo: number;
    stageHours?: number;
    estimated?: boolean;
    onHold?: boolean;
  }) => {
    const createdAt = new Date(now.getTime() - config.daysAgo * 24 * 60 * 60 * 1000);
    const stageEnteredAt = config.stageHours
      ? new Date(now.getTime() - config.stageHours * 60 * 60 * 1000)
      : createdAt;

    const requestId = nanoid();
    const reqNum = `REQ-${String(requestNumber++).padStart(4, '0')}`;

    const requestData: any = {
      id: requestId,
      requestNumber: reqNum,
      title: config.title,
      description: `This is a detailed description for: ${config.title}. It includes all necessary context and requirements for the team to understand and process this request effectively.`,
      type: config.type,
      stage: config.stage,
      priority: config.priority,
      stageEnteredAt,
      businessJustification:
        config.type === 'feature'
          ? 'This will improve user experience and increase customer satisfaction.'
          : null,
      desiredDeliveryDate:
        config.stage === 'ready' ? new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000) : null,
      stepsToReproduce:
        config.type === 'bug'
          ? '1. Navigate to the page\\n2. Click on the button\\n3. Observe the error'
          : null,
      dependencies:
        Math.random() > 0.7 ? 'Depends on completion of authentication system update' : null,
      additionalNotes:
        Math.random() > 0.5
          ? 'Additional context: This is a high-visibility request from the client.'
          : null,
      requesterId: config.requester.id,
      assignedPmId: config.assignedPm?.id || null,
      estimatorId: config.estimator?.id || null,
      clientId: config.client.id,
      tags:
        config.type === 'bug'
          ? ['bug', 'urgent']
          : config.type === 'feature'
            ? ['feature', 'enhancement']
            : [],
      createdAt,
      updatedAt: now,
    };

    // Add estimation data if estimated
    if (config.estimated || config.stage === 'ready') {
      requestData.storyPoints = storyPoints[Math.floor(Math.random() * storyPoints.length)];
      requestData.confidence = confidences[Math.floor(Math.random() * confidences.length)];
      requestData.estimationNotes =
        'Estimation based on similar previous work. Consider complexity of integration points.';
      requestData.estimatedAt = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    }

    // Add hold data if on hold
    if (config.onHold || config.stage === 'on_hold') {
      requestData.holdReason = 'Awaiting additional information from client';
      requestData.holdStartedAt = stageEnteredAt;
    }

    const [newRequest] = await db.insert(request).values(requestData).returning();

    // Create history entry for creation
    if (newRequest) {
      await db.insert(requestHistory).values({
        id: nanoid(),
        requestId: newRequest.id,
        actorId: config.requester.id,
        action: 'created',
        metadata: { description: 'Request created' },
        createdAt,
      });

      // Add stage change history if not in initial stage
      if (config.stage !== 'in_treatment') {
        await db.insert(requestHistory).values({
          id: nanoid(),
          requestId: newRequest.id,
          actorId: config.assignedPm?.id || config.requester.id,
          action: 'stage_changed',
          metadata: { oldStage: 'in_treatment', newStage: config.stage },
          createdAt: stageEnteredAt,
        });
      }

      requests.push(newRequest);
    }
  };

  // STAGE 1: In Treatment (New requests, some aging)
  // 3 fresh requests (< 24 hours)
  for (let i = 0; i < 3; i++) {
    const titles = requestTitles.feature;
    await createRequest({
      title: titles[i % titles.length]!,
      type: 'feature',
      stage: 'in_treatment',
      priority: priorities[i % priorities.length]!,
      client: clients[i % clients.length]!,
      requester: internalUsers[i % internalUsers.length]!,
      daysAgo: 0,
      stageHours: Math.floor(Math.random() * 12),
    });
  }

  // 2 requests approaching threshold (24-36 hours)
  for (let i = 0; i < 2; i++) {
    const titles = requestTitles.bug;
    await createRequest({
      title: titles[i % titles.length]!,
      type: 'bug',
      stage: 'in_treatment',
      priority: 'high',
      client: clients[(i + 1) % clients.length]!,
      requester: internalUsers[(i + 1) % internalUsers.length]!,
      assignedPm: internalUsers[0],
      daysAgo: 1,
      stageHours: 30,
    });
  }

  // 2 aging requests (> 48 hours - critical threshold)
  for (let i = 0; i < 2; i++) {
    const titles = requestTitles.enhancement;
    await createRequest({
      title: titles[i % titles.length]!,
      type: 'enhancement',
      stage: 'in_treatment',
      priority: 'critical',
      client: clients[(i + 2) % clients.length]!,
      requester: internalUsers[(i + 2) % internalUsers.length]!,
      assignedPm: internalUsers[1],
      daysAgo: 3,
      stageHours: 60,
    });
  }

  // STAGE 2: On Hold (Waiting for info)
  // 2 recent holds
  for (let i = 0; i < 2; i++) {
    const titles = requestTitles.change_request;
    await createRequest({
      title: titles[i % titles.length]!,
      type: 'change_request',
      stage: 'on_hold',
      priority: 'medium',
      client: clients[i % clients.length]!,
      requester: internalUsers[i % internalUsers.length]!,
      assignedPm: internalUsers[0],
      daysAgo: 2,
      stageHours: 24,
      onHold: true,
    });
  }

  // 1 aging hold (> 7 days)
  await createRequest({
    title: requestTitles.support[0]!,
    type: 'support',
    stage: 'on_hold',
    priority: 'low',
    client: clients[0]!,
    requester: internalUsers[0]!,
    assignedPm: internalUsers[1],
    daysAgo: 10,
    stageHours: 200,
    onHold: true,
  });

  // STAGE 3: Estimation (Awaiting story points)
  // 3 fresh estimation requests
  for (let i = 0; i < 3; i++) {
    const titles = requestTitles.feature;
    await createRequest({
      title: titles[(i + 3) % titles.length]!,
      type: 'feature',
      stage: 'estimation',
      priority: priorities[(i + 1) % priorities.length]!,
      client: clients[(i + 1) % clients.length]!,
      requester: internalUsers[i % internalUsers.length]!,
      assignedPm: internalUsers[0],
      estimator: internalUsers[(i + 1) % internalUsers.length],
      daysAgo: 1,
      stageHours: 8,
    });
  }

  // 2 aging estimation (> 24 hours)
  for (let i = 0; i < 2; i++) {
    const titles = requestTitles.enhancement;
    await createRequest({
      title: titles[(i + 2) % titles.length]!,
      type: 'enhancement',
      stage: 'estimation',
      priority: 'high',
      client: clients[(i + 2) % clients.length]!,
      requester: internalUsers[(i + 1) % internalUsers.length]!,
      assignedPm: internalUsers[1],
      estimator: internalUsers[(i + 2) % internalUsers.length],
      daysAgo: 2,
      stageHours: 30,
    });
  }

  // STAGE 4: Ready (Estimated, awaiting conversion)
  // 4 ready requests with various story points
  for (let i = 0; i < 4; i++) {
    const titles = requestTitles.feature;
    await createRequest({
      title: titles[(i + 4) % titles.length]!,
      type: i < 2 ? 'feature' : 'enhancement',
      stage: 'ready',
      priority: priorities[i % priorities.length]!,
      client: clients[i % clients.length]!,
      requester: internalUsers[i % internalUsers.length]!,
      assignedPm: internalUsers[0],
      estimator: internalUsers[1],
      daysAgo: 1,
      stageHours: 4,
      estimated: true,
    });
  }

  // 2 aging ready requests (> 12 hours)
  for (let i = 0; i < 2; i++) {
    const titles = requestTitles.bug;
    await createRequest({
      title: titles[(i + 3) % titles.length]!,
      type: 'bug',
      stage: 'ready',
      priority: 'critical',
      client: clients[(i + 1) % clients.length]!,
      requester: internalUsers[(i + 1) % internalUsers.length]!,
      assignedPm: internalUsers[1],
      estimator: internalUsers[0],
      daysAgo: 1,
      stageHours: 18,
      estimated: true,
    });
  }

  console.log(`✅ Created ${requests.length} intake requests\n`);
  console.log('   → In Treatment: 7 requests (3 fresh, 2 approaching, 2 aging)');
  console.log('   → On Hold: 3 requests (2 recent, 1 aging)');
  console.log('   → Estimation: 5 requests (3 fresh, 2 aging)');
  console.log('   → Ready: 6 requests (4 fresh, 2 aging)');

  return requests;
}

/**
 * Default dashboard layouts by role
 */
const DEFAULT_LAYOUTS: Record<string, WidgetLayout[]> = {
  developer: [
    { id: 'my-work-today', type: 'my-work-today', size: 'large', position: 0, visible: true },
    { id: 'current-sprint', type: 'current-sprint', size: 'medium', position: 1, visible: true },
    { id: 'blockers', type: 'blockers', size: 'medium', position: 2, visible: true },
    {
      id: 'upcoming-deadlines',
      type: 'upcoming-deadlines',
      size: 'medium',
      position: 3,
      visible: true,
    },
    { id: 'recent-activity', type: 'recent-activity', size: 'medium', position: 4, visible: true },
  ],
  admin: [
    { id: 'org-health', type: 'organization-health', size: 'medium', position: 0, visible: true },
    { id: 'critical-alerts', type: 'critical-alerts', size: 'medium', position: 1, visible: true },
    { id: 'team-status', type: 'team-status', size: 'medium', position: 2, visible: true },
    {
      id: 'upcoming-deadlines',
      type: 'upcoming-deadlines',
      size: 'medium',
      position: 3,
      visible: true,
    },
    { id: 'recent-activity', type: 'recent-activity', size: 'medium', position: 4, visible: true },
    {
      id: 'financial-snapshot',
      type: 'financial-snapshot',
      size: 'medium',
      position: 5,
      visible: true,
    },
  ],
  client: [
    {
      id: 'upcoming-deadlines',
      type: 'upcoming-deadlines',
      size: 'medium',
      position: 0,
      visible: true,
    },
    {
      id: 'financial-snapshot',
      type: 'financial-snapshot',
      size: 'medium',
      position: 1,
      visible: true,
    },
    { id: 'recent-activity', type: 'recent-activity', size: 'medium', position: 2, visible: true },
  ],
};

/**
 * Seed Dashboard Preferences
 */
async function seedDashboardPreferences(internalUsers: any[], clientUsers: any[]) {
  console.log('📊 Seeding dashboard preferences...');

  let prefsCount = 0;

  // Seed preferences for internal users (developer layout)
  for (const internalUser of internalUsers) {
    await db.insert(userDashboardPreferences).values({
      userId: internalUser.id,
      layout: DEFAULT_LAYOUTS.developer,
      collapsedWidgets: [],
    });
    prefsCount++;
  }

  // Seed preferences for client users (client layout)
  for (const clientUser of clientUsers) {
    await db.insert(userDashboardPreferences).values({
      userId: clientUser.id,
      layout: DEFAULT_LAYOUTS.client,
      collapsedWidgets: [],
    });
    prefsCount++;
  }

  // Seed admin preferences for admin user if exists
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    const [adminUser] = await db.select().from(user).where(eq(user.email, adminEmail));
    if (adminUser) {
      await db.insert(userDashboardPreferences).values({
        userId: adminUser.id,
        layout: DEFAULT_LAYOUTS.admin,
        collapsedWidgets: [],
      });
      prefsCount++;
      console.log(`   → Seeded admin dashboard preferences for ${adminEmail}`);
    }
  }

  console.log(`✅ Created ${prefsCount} dashboard preferences\n`);
}

/**
 * Main seed function
 */
async function seed() {
  try {
    console.log('🌱 Starting Business Center seed...\n');

    // Clear existing data
    await clearData();

    // Seed roles first (needed for role assignments)
    const roles = await seedRoles();

    // Seed data
    const { internalUsers, clientUsers } = await seedUsers();
    const { creativeClients, softwareClients, fullServiceClients } = await seedClients(clientUsers);
    const allClients = [...creativeClients, ...softwareClients, ...fullServiceClients];

    await seedTickets(allClients, internalUsers);
    const projects = await seedProjects(allClients, internalUsers);
    await seedProjectAssignments(projects, internalUsers);
    const sprints = await seedSprints(projects);
    const intakeRequests = await seedRequests(allClients, internalUsers);
    await seedDashboardPreferences(internalUsers, clientUsers);

    // Seed role assignments (after users are created)
    await seedRoleAssignments(internalUsers, clientUsers, roles);

    console.log('✅ Seed completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - ${internalUsers.length} internal users (team members)`);
    console.log(`   - ${clientUsers.length} client users`);
    console.log(
      `   - ${allClients.length} clients (${creativeClients.length} creative, ${softwareClients.length} software, ${fullServiceClients.length} full-service)`
    );
    console.log(
      `   - ${SEED_CONFIG.intakeTicketsUnassigned + SEED_CONFIG.intakeTicketsAssigned} tickets`
    );
    console.log(`   - ${projects.length} projects (various stages)`);
    console.log(`   - ${sprints.length} sprints (completed, active, planning)`);
    console.log(`   - ${intakeRequests.length} intake pipeline requests (all stages)`);
    console.log(
      `   - ${internalUsers.length + clientUsers.length + 1} dashboard preferences (per-user)`
    );
    console.log(`   - 4 default roles (admin, editor, viewer, client)`);
    console.log(`   - Team capacity: 50%, 75%, 85%, 100%, 120%, 150%\n`);

    console.log('🎯 Business Center is ready for testing!');
    console.log(
      '   → Intake Pipeline: Requests in all 4 stages (treatment, hold, estimation, ready)'
    );
    console.log('   → Intake Queue: Unassigned tickets');
    console.log('   → Active Work: Projects in all stages');
    console.log('   → Team Capacity: Various load levels');
    console.log('   → Delivery Calendar: Upcoming deliveries');
    console.log('   → Recently Completed: Last 14 days');
    console.log('   → Role-based Access: Admin, Editor, Viewer, Client roles\n');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

// Run seed
seed();
