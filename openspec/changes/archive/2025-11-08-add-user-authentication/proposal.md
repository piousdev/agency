# Change: Add User Authentication & Role-Based Access Control

## Why

The Skyll Platform requires secure authentication and authorization to:

- Distinguish between client types (Creative Services, Software Services, Full
  Service, One-Time)
- Enforce role-based access control for internal team members (Creative,
  Technical, Operations teams)
- Ensure data isolation (clients only see their own projects and data)
- Support multi-user organizations and invitation-based onboarding
- Scale to 1M+ users globally

This is the foundational capability that enables all other platform features.

## What Changes

- Implement BetterAuth integration for session management and authentication
- Create user account system with email/password authentication
- Define client type system (Type A, B, C, One-Time) with associated permissions
- Define internal team roles with hierarchical permissions:
  - **Creative Team**: Creative Director, Designers, Content Creators
  - **Technical Team**: Engineering Lead, Developers, DevOps Engineer
  - **Operations Team**: Admin, Project Manager, Account Manager, Admin Staff
- Build invitation system for client onboarding (different invite links create
  different client types)
- Implement organization/company management (multiple users per company)
- Add session management and secure logout
- Create middleware for route protection based on roles
- Implement "Remember Me" functionality for persistent sessions

## Impact

- **Affected specs**: `authentication` (new capability)
- **Affected code**:
  - `apps/api/src/auth/` - BetterAuth configuration and endpoints
  - `apps/web/src/middleware.ts` - Route protection
  - `apps/web/src/lib/auth/` - Client-side auth utilities
  - `apps/api/src/db/schema/users.ts` - User and role schemas (Drizzle)
  - `apps/web/src/components/auth/` - Login, signup, invitation acceptance
    components
- **Dependencies**: BetterAuth, Drizzle ORM, Neon Postgres
- **Security**: Critical - all data access depends on proper authentication and
  authorization
