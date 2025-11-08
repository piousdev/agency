# Design: User Authentication & Role-Based Access Control

## Context

Skyll Platform needs to authenticate and authorize users across multiple client types and internal team roles. The system must support:

- 1M+ users globally (high scale requirement)
- Multiple client types with different permissions
- Complex internal team structure across creative, technical, and operations teams
- Organization-level access (multiple users per company)
- Invitation-based onboarding workflow
- Data isolation (clients only see their own data)

**Constraints**:

- Must use BetterAuth (selected in tech stack)
- Must integrate with Neon Postgres via Drizzle ORM
- Must support Next.js App Router and Hono API
- Must be secure and compliant with authentication best practices

**Stakeholders**:

- Clients (need easy login and access to their projects)
- Skyll team (need role-based access to relevant data)
- Admin (needs full control over user management)

## Goals / Non-Goals

**Goals**:

- Secure authentication with session management
- Flexible role-based authorization system
- Support for invitation-based client onboarding
- Organization/company support (multi-user accounts)
- Type-safe API with Hono RPC
- Scalable to 1M+ users

**Non-Goals**:

- Social login (OAuth) - can add later if needed
- Two-factor authentication (2FA) - future enhancement
- Single Sign-On (SSO) - not required for MVP
- Password reset via SMS - email only for now

## Decisions

### Decision 1: Client Type Storage Strategy

**What**: Store client type as an enum on the users table (`user_type` column)

**Why**:

- Simple and performant (no joins required)
- Client type is immutable (doesn't change after creation)
- Each user has exactly one client type
- Easy to filter and query by type

**Alternatives Considered**:

- Separate `client_types` table with foreign key → Unnecessary complexity for a fixed enum
- Role-based approach (treat client types as roles) → Doesn't align with internal team roles semantics

### Decision 2: Internal Team Roles Architecture

**What**: Create a flexible `roles` table with JSONB permissions column

**Why**:

- Supports complex permission hierarchies (e.g., Creative Director > Designer)
- Allows fine-grained permissions (e.g., "can_approve_creative", "can_assign_tickets")
- Easy to extend without schema migrations
- Aligns with future requirements (custom roles)

**Schema**:

```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL, -- e.g., "Creative Director", "Developer"
  role_type VARCHAR(50), -- 'creative' | 'technical' | 'operations'
  permissions JSONB -- { "can_approve_creative": true, "can_view_all_projects": true }
);

CREATE TABLE user_roles (
  user_id UUID REFERENCES users(id),
  role_id UUID REFERENCES roles(id),
  PRIMARY KEY (user_id, role_id)
);
```

**Alternatives Considered**:

- Hardcoded permissions in code → Not flexible, requires deployments for changes
- Permission strings array → Less structured, harder to query
- Separate permission tables → Over-engineered for MVP

### Decision 3: Session Management Strategy

**What**: Database-backed sessions using BetterAuth with Drizzle adapter

**Why**:

- Supports "Remember Me" with variable session durations
- Enables session revocation (logout from all devices)
- Scales better than JWT for write-heavy operations
- Aligns with BetterAuth best practices
- Supports 1M+ users with Neon Postgres connection pooling

**Session Configuration**:

- Default session: 7 days
- "Remember Me": 30 days
- Idle timeout: 24 hours without activity

**Alternatives Considered**:

- Pure JWT tokens → Cannot revoke, harder to manage at scale
- Redis-backed sessions → Adds infrastructure complexity, Postgres is sufficient for MVP

### Decision 4: Invitation System Design

**What**: Token-based invitations with typed invite links

**Why**:

- Different invite links create different client types (Type A, B, C, One-Time)
- Admin generates invite → System creates token → Client clicks link → Creates account with predefined type
- Tokens expire after 7 days
- One-time use (deleted after acceptance)

**Flow**:

1. Admin creates invitation via UI (selects client type)
2. System generates unique token, sends email via Resend
3. Client clicks link: `/accept-invite/{token}`
4. System validates token, shows account creation form
5. Client completes signup, account created with associated client type
6. Token is deleted

**Alternatives Considered**:

- Admin creates accounts directly → Less secure, requires password distribution
- Email-only invitations (no token) → Prone to abuse, less secure
- Magic links for login → Doesn't fit onboarding workflow

### Decision 5: Authorization Middleware Architecture

**What**: Layered middleware approach in both Next.js and Hono

**Next.js Middleware** (`middleware.ts`):

- Checks if user is authenticated (has valid session)
- Redirects to login if not authenticated
- Runs on all protected routes

**Hono API Middleware**:

- `requireAuth()` - Ensures valid session exists
- `requireRole(...roles)` - Checks user has one of specified roles
- `requireClientType(...types)` - Checks client has allowed type
- `requirePermission(...permissions)` - Fine-grained permission checks

**Example**:

```typescript
// Hono API
app.post(
  '/api/projects/create',
  requireAuth(),
  requireRole('admin', 'project_manager'),
  async (c) => {
    /* handler */
  }
);

// Next.js Page
// middleware.ts protects all /dashboard/* routes
export function middleware(request: NextRequest) {
  const session = await getSession(request);
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect('/login');
  }
}
```

**Why**:

- Type-safe with Hono RPC
- Reusable across all endpoints
- Clear separation of authentication vs authorization
- Composable (can chain multiple middleware)

## Risks / Trade-offs

### Risk 1: Database Load at Scale

**Risk**: With 1M+ users, session table could grow large and slow down queries

**Mitigation**:

- Index on `user_id` and `expires_at` columns
- Use Neon's connection pooling
- Set up automated session cleanup (delete expired sessions daily via QStash job)
- Monitor query performance with Sentry
- Consider read replicas if needed (future)

### Risk 2: BetterAuth Maturity

**Risk**: BetterAuth is relatively new compared to NextAuth/Clerk

**Mitigation**:

- BetterAuth is well-maintained and actively developed
- Good TypeScript support and documentation
- Abstraction layer in `apps/web/src/lib/auth/` makes it easier to swap if needed
- Open-source with community support

### Risk 3: Permission System Complexity

**Risk**: JSONB permissions could become hard to manage and debug

**Mitigation**:

- Start with simple permissions (10-15 max for MVP)
- Document all permissions in code comments
- Create utility functions for common permission checks
- Admin UI for visualizing role permissions (future enhancement)
- Use TypeScript types to enforce valid permission names

### Risk 4: Invitation Token Security

**Risk**: Tokens could be intercepted or guessed

**Mitigation**:

- Generate cryptographically secure random tokens (32 bytes)
- Tokens expire after 7 days
- One-time use (deleted after acceptance)
- HTTPS only (enforced in production)
- Rate limit invitation creation endpoint

## Migration Plan

**Phase 1: Initial Setup (Week 1)**

1. Create database schema and run migrations
2. Install and configure BetterAuth
3. Set up basic login/logout endpoints
4. Create protected route middleware

**Phase 2: Client Types & Invitations (Week 2)** 5. Implement invitation system 6. Create client type logic 7. Build invitation acceptance flow 8. Admin UI for sending invitations

**Phase 3: Team Roles (Week 3)** 9. Create roles table and seed data 10. Implement role-based middleware 11. Add permission checks across API 12. Admin UI for role management

**Phase 4: Testing & Hardening (Week 4)** 13. Write comprehensive tests 14. Security audit (rate limiting, CSRF, etc.) 15. Performance testing (simulate 10k concurrent users) 16. Deploy to staging and production

**Rollback Plan**:

- All database migrations are reversible
- Feature flags for gradual rollout (PostHog)
- Can disable specific auth flows without full rollback

## Open Questions

1. **Should we support changing client types post-creation?**
   - Leaning No for MVP - client types should be immutable
   - Can add admin override later if needed

2. **Do we need audit logging for authentication events?**
   - Yes - log all login attempts, role changes, invitation sends
   - Use Sentry for critical events, database for full audit trail

3. **Should one-time clients have automatic account expiration?**
   - Yes - set `expires_at` field on user account
   - QStash job runs daily to disable expired accounts
   - Admin can extend expiration if needed

4. **Password reset: Email-only or support phone/SMS later?**
   - Email-only for MVP
   - Add phone/SMS as future enhancement if requested
