# API Architecture Guide

## Core Principles

### 1. Separation of Concerns (SOC) & Single Responsibility Principle (SRP)

**CRITICAL RULE**: Every source file MUST be under 250 lines of code.

- Each file should have ONE clear responsibility
- Split large route files by feature/endpoint
- Separate concerns: schemas, handlers, business logic, utilities

**Actual Structure (Reference Implementation):**

```
src/
  schemas/                    # Centralized Zod validation schemas
    user.ts (46 lines)        # All user-related schemas
    role.ts (12 lines)        # All role-related schemas
    invitation.ts (101 lines) # All invitation-related schemas

  routes/
    users/                    # User management routes (8 files, largest 165 lines)
      index.ts (22 lines)     # Main router - combines all user routes
      list.ts (119 lines)     # GET /api/users (list/search/pagination)
      get.ts (84 lines)       # GET /api/users/:id (single user with roles)
      update.ts (104 lines)   # PATCH /api/users/:id (update user details)
      delete.ts (56 lines)    # DELETE /api/users/:id (delete user)
      internal-status.ts (73 lines) # PATCH /api/users/:id/internal-status
      expiration.ts (75 lines)      # PATCH /api/users/:id/extend-expiration
      roles.ts (165 lines)    # POST /:id/assign-role, DELETE /:id/roles/:roleId

    roles/                    # Role management routes (3 files)
      index.ts                # Main router
      list.ts                 # GET /api/roles (list/filter roles)
      get.ts                  # GET /api/roles/:id (single role)

    invitations/              # Invitation routes (4 files, was 293 lines)
      index.ts                # Main router
      create.ts               # POST /api/invitations/create
      validate.ts             # GET /api/invitations/validate/:token
      accept.ts               # POST /api/invitations/accept

    db-test.ts (31 lines)     # Simple utility route (OK as single file)
```

**Key Pattern:**

- **Centralized schemas**: All Zod schemas live in `src/schemas/` organized by
  domain
- **One schema file per domain**: `user.ts`, `role.ts`, `invitation.ts`, etc.
- **Routes import from schemas/**:
  `import { updateUserSchema } from '../../schemas/user'`
- **One endpoint per file**: Unless closely related and under 250 lines combined
- **Index file**: Composes all routes in the domain
- **Consistent naming**: File names match route purpose (get, list, update,
  delete)

### 2. File Organization

#### Route Files

- **ONE endpoint per file** for complex operations
- **Group related simple operations** if they stay under 250 lines
- Export a Hono app instance from each route file
- Compose routes in `index.ts` using `app.route()`

#### Schema Files

**Centralized Schema Organization** (Required Pattern):

All Zod validation schemas MUST be located in `src/schemas/` directory, NOT in
route folders.

```
src/
  schemas/
    user.ts           # All user-related validation schemas
    role.ts           # All role-related validation schemas
    invitation.ts     # All invitation-related validation schemas
    client.ts         # All client-related validation schemas
    project.ts        # All project-related validation schemas
```

**Why Centralized Schemas:**

- **Reusability**: Schemas can be imported across different route files
- **Single Source of Truth**: No duplicate schema definitions
- **Easier Testing**: Test schemas independently of routes
- **Type Safety**: TypeScript types can be derived and shared
- **Better Organization**: Clear separation between validation and business
  logic

**Example Schema File (`schemas/user.ts`):**

```typescript
import { z } from 'zod';

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  // ... other fields
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  // ... other fields
});

// Export types for TypeScript
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
```

**Import Pattern in Routes:**

```typescript
// ✅ CORRECT - Import from centralized schemas
import { updateUserSchema } from '../../schemas/user';

// ❌ WRONG - Don't create schemas in route files
import { updateUserSchema } from './schemas';
```

#### Middleware Files

- One concern per middleware file
- Keep middleware focused and composable
- Document side effects clearly

### 3. Route Handler Pattern

```typescript
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { HTTPException } from 'hono/http-exception';
import {
  requireAuth,
  requireInternal,
  type AuthVariables,
} from '../middleware/auth';
import { updateUserSchema } from './schemas';

const app = new Hono<{ Variables: AuthVariables }>();

/**
 * PATCH /api/users/:id
 * Update user details
 * Protected: Requires authentication and internal team member status
 */
app.patch(
  '/:id',
  requireAuth(),
  requireInternal(),
  zValidator('json', updateUserSchema),
  async (c) => {
    // Implementation
  }
);

export default app;
```

### 4. Error Handling

- Use `HTTPException` for expected errors with proper status codes
- Log unexpected errors before throwing 500
- Always include helpful error messages
- Catch and re-throw `HTTPException` to preserve status codes

```typescript
try {
  // Operation
} catch (error) {
  if (error instanceof HTTPException) {
    throw error; // Preserve status code
  }
  console.error('Error context:', error);
  throw new HTTPException(500, { message: 'User-friendly message' });
}
```

### 5. Database Queries

- Use Drizzle ORM query builder
- Prefer relational queries over joins when possible
- Always validate data exists before operations
- Use transactions for multi-step operations

```typescript
const user = await db.query.user.findFirst({
  where: eq(user.id, userId),
  with: {
    roleAssignments: {
      with: {
        role: true,
      },
    },
  },
});
```

### 6. Authentication & Authorization

- Use `requireAuth()` middleware for authenticated routes
- Use `requireInternal()` for admin/internal team routes
- Access authenticated user via `c.get('user')`
- Validate permissions before operations

### 7. API Response Format

**Success Response:**

```typescript
{
  success: true,
  data: { /* response data */ },
  message?: 'Optional success message'
}
```

**Error Response:**

```typescript
{
  success: false,
  message: 'Error description'
}
```

**Paginated Response:**

```typescript
{
  success: true,
  data: [/* items */],
  pagination: {
    page: 1,
    pageSize: 20,
    totalCount: 100,
    totalPages: 5,
    hasNextPage: true,
    hasPreviousPage: false
  }
}
```

### 8. Naming Conventions

- **Files**: kebab-case (e.g., `internal-status.ts`)
- **Variables/Functions**: camelCase (e.g., `updateUser`)
- **Types/Interfaces**: PascalCase (e.g., `AuthVariables`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_PAGE_SIZE`)
- **Routes**: kebab-case URLs (e.g., `/api/users/:id/internal-status`)

### 9. Validation

- Use Zod for all input validation
- Validate query params, body, and path params
- Export schemas for reuse and testing
- Provide clear validation error messages

### 10. Testing

- Write integration tests for all endpoints
- Test authentication/authorization rules
- Test error cases and edge cases
- Mock database for unit tests

## Enforcement

Before committing code, verify:

- [ ] All files are under 250 lines
- [ ] Each file has a single, clear responsibility
- [ ] Schemas are separated from handlers
- [ ] Error handling follows the pattern
- [ ] Response format is consistent
- [ ] Authentication/authorization is correct

## Migration Guide

When a file exceeds 250 lines:

1. Identify logical boundaries (endpoints, concerns)
2. Create a directory for the domain (e.g., `users/`)
3. Extract each concern to its own file
4. Create an `index.ts` to compose routes
5. Update imports in main router
6. Verify all routes still work

## Examples

See `routes/users/` for a complete example of proper SOC/SRP implementation.
