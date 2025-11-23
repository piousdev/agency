import { relations } from 'drizzle-orm';
import { account } from './account';
import { activity } from './activity';
import { checklist, checklistItem } from './checklist';
import { client } from './client';
import { clientContact } from './client-contact';
import { comment } from './comment';
import { file } from './file';
import { invitation } from './invitation';
import { label, projectLabel, ticketLabel } from './label';
import { milestone } from './milestone';
import { project } from './project';
import { projectAssignment } from './project-assignment';
import { role } from './role';
import { roleAssignment } from './role-assignment';
import { session } from './session';
import { sprint } from './sprint';
import { ticket, ticketActivity } from './ticket';
import { user } from './user';
import { userToClient } from './user-to-client';
import { projectWatcher, ticketWatcher } from './watcher';

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  createdInvitations: many(invitation),
  clients: many(userToClient),
  roleAssignments: many(roleAssignment, { relationName: 'userRoleAssignments' }),
  rolesAssignedByUser: many(roleAssignment, { relationName: 'assignedRoles' }),
  createdTickets: many(ticket, { relationName: 'createdTickets' }),
  assignedTickets: many(ticket, { relationName: 'assignedTickets' }),
  projectAssignments: many(projectAssignment),
  comments: many(comment),
  files: many(file),
  activities: many(activity),
  ticketActivities: many(ticketActivity),
  // New relations for industry-standard features
  ownedProjects: many(project, { relationName: 'projectOwner' }),
  projectWatching: many(projectWatcher),
  ticketWatching: many(ticketWatcher),
  completedChecklistItems: many(checklistItem, { relationName: 'completedBy' }),
  assignedChecklistItems: many(checklistItem, { relationName: 'assignedChecklistItems' }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const clientRelations = relations(client, ({ many }) => ({
  users: many(userToClient),
  projects: many(project),
  tickets: many(ticket),
  invitations: many(invitation),
  // New relation for multiple contacts
  contacts: many(clientContact),
}));

export const userToClientRelations = relations(userToClient, ({ one }) => ({
  user: one(user, {
    fields: [userToClient.userId],
    references: [user.id],
  }),
  client: one(client, {
    fields: [userToClient.clientId],
    references: [client.id],
  }),
}));

export const projectRelations = relations(project, ({ one, many }) => ({
  client: one(client, {
    fields: [project.clientId],
    references: [client.id],
  }),
  owner: one(user, {
    fields: [project.ownerId],
    references: [user.id],
    relationName: 'projectOwner',
  }),
  projectAssignments: many(projectAssignment),
  tickets: many(ticket),
  comments: many(comment),
  files: many(file),
  activities: many(activity),
  // New industry-standard relations
  milestones: many(milestone),
  sprints: many(sprint),
  watchers: many(projectWatcher),
  labels: many(projectLabel),
  checklists: many(checklist, { relationName: 'projectChecklists' }),
}));

export const ticketRelations = relations(ticket, ({ one, many }) => ({
  project: one(project, {
    fields: [ticket.projectId],
    references: [project.id],
  }),
  client: one(client, {
    fields: [ticket.clientId],
    references: [client.id],
  }),
  createdBy: one(user, {
    fields: [ticket.createdById],
    references: [user.id],
    relationName: 'createdTickets',
  }),
  assignedTo: one(user, {
    fields: [ticket.assignedToId],
    references: [user.id],
    relationName: 'assignedTickets',
  }),
  parentTicket: one(ticket, {
    fields: [ticket.parentTicketId],
    references: [ticket.id],
    relationName: 'childTickets',
  }),
  childTickets: many(ticket, { relationName: 'childTickets' }),
  comments: many(comment),
  files: many(file),
  activities: many(ticketActivity),
  // New industry-standard relations
  sprint: one(sprint, {
    fields: [ticket.sprintId],
    references: [sprint.id],
  }),
  watchers: many(ticketWatcher),
  labels: many(ticketLabel),
  checklists: many(checklist, { relationName: 'ticketChecklists' }),
}));

export const ticketActivityRelations = relations(ticketActivity, ({ one }) => ({
  ticket: one(ticket, {
    fields: [ticketActivity.ticketId],
    references: [ticket.id],
  }),
  actor: one(user, {
    fields: [ticketActivity.actorId],
    references: [user.id],
  }),
}));

export const commentRelations = relations(comment, ({ one, many }) => ({
  ticket: one(ticket, {
    fields: [comment.ticketId],
    references: [ticket.id],
  }),
  project: one(project, {
    fields: [comment.projectId],
    references: [project.id],
  }),
  author: one(user, {
    fields: [comment.authorId],
    references: [user.id],
  }),
  files: many(file),
}));

export const fileRelations = relations(file, ({ one }) => ({
  project: one(project, {
    fields: [file.projectId],
    references: [project.id],
  }),
  ticket: one(ticket, {
    fields: [file.ticketId],
    references: [ticket.id],
  }),
  comment: one(comment, {
    fields: [file.commentId],
    references: [comment.id],
  }),
  uploadedBy: one(user, {
    fields: [file.uploadedById],
    references: [user.id],
  }),
}));

export const invitationRelations = relations(invitation, ({ one }) => ({
  createdBy: one(user, {
    fields: [invitation.createdById],
    references: [user.id],
  }),
  client: one(client, {
    fields: [invitation.clientId],
    references: [client.id],
  }),
}));

export const roleRelations = relations(role, ({ many }) => ({
  assignments: many(roleAssignment),
}));

export const roleAssignmentRelations = relations(roleAssignment, ({ one }) => ({
  user: one(user, {
    fields: [roleAssignment.userId],
    references: [user.id],
    relationName: 'userRoleAssignments',
  }),
  role: one(role, {
    fields: [roleAssignment.roleId],
    references: [role.id],
  }),
  assignedBy: one(user, {
    fields: [roleAssignment.assignedById],
    references: [user.id],
    relationName: 'assignedRoles',
  }),
}));

export const projectAssignmentRelations = relations(projectAssignment, ({ one }) => ({
  project: one(project, {
    fields: [projectAssignment.projectId],
    references: [project.id],
  }),
  user: one(user, {
    fields: [projectAssignment.userId],
    references: [user.id],
  }),
}));

export const activityRelations = relations(activity, ({ one }) => ({
  project: one(project, {
    fields: [activity.projectId],
    references: [project.id],
  }),
  actor: one(user, {
    fields: [activity.actorId],
    references: [user.id],
  }),
}));

// ============================================
// New industry-standard relations
// ============================================

// Client Contact relations
export const clientContactRelations = relations(clientContact, ({ one }) => ({
  client: one(client, {
    fields: [clientContact.clientId],
    references: [client.id],
  }),
}));

// Sprint relations
export const sprintRelations = relations(sprint, ({ one, many }) => ({
  project: one(project, {
    fields: [sprint.projectId],
    references: [project.id],
  }),
  tickets: many(ticket),
}));

// Milestone relations
export const milestoneRelations = relations(milestone, ({ one }) => ({
  project: one(project, {
    fields: [milestone.projectId],
    references: [project.id],
  }),
}));

// Label relations
export const labelRelations = relations(label, ({ many }) => ({
  projectLabels: many(projectLabel),
  ticketLabels: many(ticketLabel),
}));

export const projectLabelRelations = relations(projectLabel, ({ one }) => ({
  project: one(project, {
    fields: [projectLabel.projectId],
    references: [project.id],
  }),
  label: one(label, {
    fields: [projectLabel.labelId],
    references: [label.id],
  }),
}));

export const ticketLabelRelations = relations(ticketLabel, ({ one }) => ({
  ticket: one(ticket, {
    fields: [ticketLabel.ticketId],
    references: [ticket.id],
  }),
  label: one(label, {
    fields: [ticketLabel.labelId],
    references: [label.id],
  }),
}));

// Watcher relations
export const projectWatcherRelations = relations(projectWatcher, ({ one }) => ({
  project: one(project, {
    fields: [projectWatcher.projectId],
    references: [project.id],
  }),
  user: one(user, {
    fields: [projectWatcher.userId],
    references: [user.id],
  }),
}));

export const ticketWatcherRelations = relations(ticketWatcher, ({ one }) => ({
  ticket: one(ticket, {
    fields: [ticketWatcher.ticketId],
    references: [ticket.id],
  }),
  user: one(user, {
    fields: [ticketWatcher.userId],
    references: [user.id],
  }),
}));

// Checklist relations
export const checklistRelations = relations(checklist, ({ one, many }) => ({
  ticket: one(ticket, {
    fields: [checklist.ticketId],
    references: [ticket.id],
    relationName: 'ticketChecklists',
  }),
  project: one(project, {
    fields: [checklist.projectId],
    references: [project.id],
    relationName: 'projectChecklists',
  }),
  items: many(checklistItem),
}));

export const checklistItemRelations = relations(checklistItem, ({ one }) => ({
  checklist: one(checklist, {
    fields: [checklistItem.checklistId],
    references: [checklist.id],
  }),
  completedBy: one(user, {
    fields: [checklistItem.completedById],
    references: [user.id],
    relationName: 'completedBy',
  }),
  assignee: one(user, {
    fields: [checklistItem.assigneeId],
    references: [user.id],
    relationName: 'assignedChecklistItems',
  }),
}));
