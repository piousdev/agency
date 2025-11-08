import { relations } from 'drizzle-orm';
import { account } from './account';
import { client } from './client';
import { comment } from './comment';
import { file } from './file';
import { invitation } from './invitation';
import { project } from './project';
import { role } from './role';
import { roleAssignment } from './role-assignment';
import { session } from './session';
import { ticket } from './ticket';
import { user } from './user';
import { userToClient } from './user-to-client';

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  createdInvitations: many(invitation),
  clients: many(userToClient),
  roleAssignments: many(roleAssignment, { relationName: 'userRoleAssignments' }),
  rolesAssignedByUser: many(roleAssignment, { relationName: 'assignedRoles' }),
  createdTickets: many(ticket, { relationName: 'createdTickets' }),
  assignedTickets: many(ticket, { relationName: 'assignedTickets' }),
  comments: many(comment),
  files: many(file),
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
  tickets: many(ticket),
  comments: many(comment),
  files: many(file),
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
  comments: many(comment),
  files: many(file),
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
