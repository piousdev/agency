/**
 * Business Center Seed Script
 * Populates comprehensive test data for all Business Center scenarios
 */

import 'dotenv/config';
import { db } from './index.js';
import { client, user, ticket, project, projectAssignment, userToClient } from './schema/index.js';
import { eq, ne } from 'drizzle-orm';
import { nanoid } from 'nanoid';

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

  await db.delete(projectAssignment);
  await db.delete(ticket);
  await db.delete(project);
  await db.delete(userToClient);
  await db.delete(client);

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

  console.log(
    `✅ Created ${tickets.length} tickets (${SEED_CONFIG.intakeTicketsUnassigned} unassigned, ${SEED_CONFIG.intakeTicketsAssigned} assigned)\n`
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
 * Main seed function
 */
async function seed() {
  try {
    console.log('🌱 Starting Business Center seed...\n');

    // Clear existing data
    await clearData();

    // Seed data
    const { internalUsers, clientUsers } = await seedUsers();
    const { creativeClients, softwareClients, fullServiceClients } = await seedClients(clientUsers);
    const allClients = [...creativeClients, ...softwareClients, ...fullServiceClients];

    await seedTickets(allClients, internalUsers);
    const projects = await seedProjects(allClients, internalUsers);
    await seedProjectAssignments(projects, internalUsers);

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
    console.log(`   - Team capacity: 50%, 75%, 85%, 100%, 120%, 150%\n`);

    console.log('🎯 Business Center is ready for testing!');
    console.log('   → Intake Queue: Unassigned tickets');
    console.log('   → Active Work: Projects in all stages');
    console.log('   → Team Capacity: Various load levels');
    console.log('   → Delivery Calendar: Upcoming deliveries');
    console.log('   → Recently Completed: Last 14 days\n');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

// Run seed
seed();
