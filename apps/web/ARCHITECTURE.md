# Next.js Web App Architecture

## Server-First Principle

This Next.js application follows a **Server-First Architecture** to maximize performance, security, and maintainability while using Hono as our backend API.

### Core Principles

1. **Server Components by default** - All components are Server Components unless they need client-side interactivity
2. **Server Actions for mutations** - Form submissions and data mutations use Server Actions, not client-side fetch
3. **Server-to-Server API calls** - Next.js server calls Hono API directly (not through the browser)
4. **Minimal client JavaScript** - Only ship JavaScript for truly interactive components

### Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│ Browser                                                 │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Client Components (use client)                       │ │
│ │ - Forms with progressive enhancement                 │ │
│ │ - Interactive UI (modals, dropdowns)                 │ │
│ │ - useActionState for Server Action integration      │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          ↓ Server Actions
┌─────────────────────────────────────────────────────────┐
│ Next.js Server (Server Components + Server Actions)    │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Server Components                                    │ │
│ │ - Data fetching on the server                        │ │
│ │ - Initial page rendering                             │ │
│ │ - No client JavaScript needed                        │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Server Actions (app/*/actions.ts)                    │ │
│ │ - Form submission handlers                           │ │
│ │ - Data mutations                                     │ │
│ │ - Validation & error handling                        │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ API Client Layer (lib/api/)                          │ │
│ │ - Reusable functions for Hono API calls             │ │
│ │ - Type-safe interfaces                               │ │
│ │ - Used by Server Components & Server Actions        │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          ↓ HTTP (server-to-server)
┌─────────────────────────────────────────────────────────┐
│ Hono API (Backend)                                      │
│ - Business logic                                        │
│ - Database operations                                   │
│ - Authentication & authorization                        │
└─────────────────────────────────────────────────────────┘
```

## File Structure & Separation of Concerns (SOC)

### File Naming Conventions

All source files must follow strict naming conventions for consistency and clarity.

#### General Rules

1. **Use kebab-case** for all filenames (e.g., `user-profile.tsx`, `validate-password.ts`)
2. **Be descriptive but concise** - filenames should clearly indicate purpose
3. **Avoid adjectives** - No "enhanced-", "custom-", "advanced-" prefixes
4. **Avoid generic suffixes** - No "-helper", "-util", "-handler" suffixes
5. **Leverage directory context** - Don't repeat parent directory names in filenames

#### Component Files (`*.tsx`)

**Rule**: Use nouns describing what the component **is**, not what it does or how it's enhanced.

✅ **Good Examples:**

```
login-form.tsx          # Not enhanced-login-form.tsx
table.tsx               # Not users-table.tsx (when in /users/ directory)
idle-timeout.tsx        # Not idle-timeout-provider.tsx
delete-dialog.tsx       # Not delete-user-dialog.tsx (context from parent)
```

❌ **Bad Examples:**

```
enhanced-login-form.tsx        # Avoid "enhanced-" prefix
custom-button.tsx              # Avoid "custom-" prefix
users-table.tsx                # Redundant (already in /users/ directory)
user-menu-component.tsx        # Avoid "-component" suffix
```

**Note**: Component export names can be more descriptive than filenames:

- File: `login-form.tsx` → Export: `EnhancedLoginForm`
- File: `table.tsx` → Export: `UsersTable`

#### Hook Files (`use-*.ts`)

**Rule**: Use "use-" prefix followed by a verb describing the action.

✅ **Good Examples:**

```
use-auth.ts                # Not use-auth-hook.ts
use-fetch-data.ts          # Action-based naming
use-debounce.ts            # Clear action verb
```

❌ **Bad Examples:**

```
use-session-hook.ts        # Redundant "-hook" suffix
use-idle-timeout.ts        # Should be use-detect-idle.ts (verb-based)
useAuthHook.ts             # Use kebab-case, not camelCase
```

#### Utility/Library Files (`*.ts`)

**Rule**: Use verbs (for actions) or nouns (for pure data/config).

✅ **Good Examples:**

```
validate-password.ts       # Verb-based (validates passwords)
api-utils.ts               # Noun-based (collection of utilities)
format-date.ts             # Verb-based (formats dates)
templates.ts               # Noun-based (email templates)
```

❌ **Bad Examples:**

```
password-validation.ts     # Use validate-password.ts (verb-based)
helpers.ts                 # Too generic, use api-utils.ts or specific name
date-formatter-utils.ts    # Redundant, use format-date.ts
```

#### Action Files (`actions.ts`)

**Rule**: Always named `actions.ts` in feature directories.

✅ **Good Examples:**

```
app/admin/users/actions.ts
app/accept-invite/[token]/actions.ts
```

#### Middleware Files

**Rule**: Use verbs describing what the middleware does.

✅ **Good Examples:**

```
handle-errors.ts           # Not error-handler.ts
auth.ts                    # Simple noun when obvious
log-requests.ts            # Verb-based
```

#### Barrel Exports (`index.ts`)

**Rule**: Always named `index.ts` for re-exports.

```
components/auth/index.ts   # Re-exports all auth components
lib/api/users/index.ts     # Re-exports all user API functions
```

#### Exceptions

**shadcn/ui components** follow their established conventions:

```
alert-dialog.tsx           # Standard shadcn/ui pattern
dropdown-menu.tsx          # Standard shadcn/ui pattern
password-input.tsx         # Standard shadcn/ui pattern
```

### Example: Invitation Acceptance Feature

```
apps/web/src/
├── app/
│   └── accept-invite/
│       └── [token]/
│           ├── page.tsx              # Server Component (validates token)
│           ├── actions.ts            # Server Actions (handles submission)
│           └── accept-invite-form.tsx # Client Component (form UI only)
├── lib/
│   ├── api/
│   │   └── invitations.ts           # API client functions
│   └── schemas/
│       └── invitation.ts            # Zod validation schemas
```

### Responsibilities

#### 1. Server Component (`page.tsx`)

**Purpose**: Initial data fetching and rendering

```typescript
// apps/web/src/app/accept-invite/[token]/page.tsx
export default async function AcceptInvitePage({ params }) {
  const { token } = await params;

  // Server-side validation (no client JavaScript needed)
  const validation = await validateInvitation(token);

  if (!validation.valid) {
    return <ErrorComponent />;
  }

  // Pass data to client component as props
  return <AcceptInviteForm token={token} invitation={validation.invitation} />;
}
```

**Benefits**:

- ✅ Fast initial page load (HTML rendered on server)
- ✅ SEO-friendly
- ✅ No flash of loading state
- ✅ Token validation happens before any client JS loads

#### 2. Server Actions (`actions.ts`)

**Purpose**: Handle form submissions and mutations server-side

```typescript
// apps/web/src/app/accept-invite/[token]/actions.ts
'use server';

export async function acceptInviteAction(
  token: string,
  prevState: AcceptInviteState,
  formData: FormData
): Promise<AcceptInviteState> {
  // Server-side validation
  const errors = validateFormData(formData);
  if (errors) return { errors };

  // Call Hono API server-to-server (secure)
  await acceptInvitation({ token, ...data });

  // Redirect on success
  redirect('/login?message=Success');
}
```

**Benefits**:

- ✅ API calls never exposed to browser (more secure)
- ✅ No need to manage CORS for these calls
- ✅ Can use environment variables not prefixed with NEXT*PUBLIC*
- ✅ Progressive enhancement (works without JavaScript)

#### 3. Client Component (form only)

**Purpose**: Interactive form with progressive enhancement

```typescript
// apps/web/src/app/accept-invite/[token]/accept-invite-form.tsx
"use client";

export function AcceptInviteForm({ token, invitation }) {
  const boundAction = acceptInviteAction.bind(null, token);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);

  return (
    <form action={formAction}>
      {/* Form fields */}
      <Button disabled={isPending}>
        {isPending ? "Creating..." : "Create Account"}
      </Button>
    </form>
  );
}
```

**Benefits**:

- ✅ Progressive enhancement (form works without JS)
- ✅ Optimistic UI updates
- ✅ Automatic error handling from Server Action
- ✅ Small bundle size (only form logic)

#### 4. API Client Layer (`lib/api/`)

**Purpose**: Reusable functions for calling Hono API

```typescript
// apps/web/src/lib/api/invitations.ts
export async function validateInvitation(token: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/invitations/validate/${token}`
  );
  return response.json();
}
```

**Benefits**:

- ✅ Type-safe interfaces
- ✅ Reusable across Server Components & Server Actions
- ✅ Single source of truth for API calls
- ✅ Easy to test and mock

#### 5. Validation Schemas (`lib/schemas/`)

**Purpose**: Shared validation logic

```typescript
// apps/web/src/lib/schemas/invitation.ts
export const acceptInviteSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8).regex(/.../),
});
```

**Benefits**:

- ✅ DRY - validation logic in one place
- ✅ Can be used client-side (react-hook-form) or server-side (Server Actions)
- ✅ Type inference for TypeScript

## When to Use Client Components

Use `"use client"` **only** when you need:

1. **React hooks** - useState, useEffect, useRef, etc.
2. **Browser APIs** - window, document, localStorage, etc.
3. **Event listeners** - onClick, onChange, onSubmit (for custom handling)
4. **React Context** - useContext (when not using Server Context)
5. **Third-party libraries** - that require browser environment

### ❌ Don't use client components for:

- Data fetching (use Server Components + async/await)
- Form submission (use Server Actions)
- Initial page rendering (use Server Components)
- Authentication checks (use Server Components + middleware)

## Best Practices

### ✅ DO

```typescript
// Server Component - fetches data server-side
export default async function Page() {
  const data = await fetchData(); // Server-side fetch
  return <ClientComponent data={data} />;
}

// Client Component - only handles interactivity
"use client";
export function ClientComponent({ data }) {
  const [isOpen, setIsOpen] = useState(false);
  return <div onClick={() => setIsOpen(!isOpen)}>{data}</div>;
}
```

### ❌ DON'T

```typescript
// ❌ Don't make entire page a client component
"use client";
export default function Page() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(setData);
  }, []);

  return <div>{data}</div>;
}
```

## Performance Benefits

### Server-First vs Client-First

| Metric                    | Server-First        | Client-First          |
| ------------------------- | ------------------- | --------------------- |
| Time to First Byte (TTFB) | ⚡ Fast             | 🐌 Slower             |
| JavaScript Bundle Size    | ⚡ Minimal          | 🐌 Large              |
| API Security              | ✅ Server-to-server | ⚠️ Exposed to browser |
| SEO                       | ✅ Excellent        | ⚠️ Limited            |
| Works without JS          | ✅ Yes              | ❌ No                 |

## References

- [Next.js Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [React useActionState Hook](https://react.dev/reference/react/useActionState)
- [Progressive Enhancement](https://developer.mozilla.org/en-US/docs/Glossary/Progressive_Enhancement)

## Authentication & Authorization

### Defense-in-Depth Security Model (3 Layers)

Our authentication follows a **layered security approach** as recommended by Better-Auth:

```
┌─────────────────────────────────────────────────────────┐
│ Layer 1: Middleware (Edge Runtime)                      │
│ - Cookie-only optimistic check (~1ms)                   │
│ - Fast UX redirect                                      │
│ - ⚠️  NOT SECURE (only checks cookie exists)           │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Layer 2: Server Components (Security Boundary)          │
│ - Full session validation with database                 │
│ - ✅ REAL SECURITY                                      │
│ - Validates via Hono API                                │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Layer 3: Server Actions (Mutation Protection)           │
│ - Additional validation for mutations                   │
│ - Role/permission checks                                │
│ - CSRF protection (automatic)                           │
└─────────────────────────────────────────────────────────┘
```

### Layer 1: Middleware (`middleware.ts`)

**Purpose:** Fast optimistic redirect for UX

```typescript
// apps/web/src/middleware.ts
import { getSessionCookie } from 'better-auth/cookies';

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  // Redirect if no cookie found (optimistic)
  if (!sessionCookie && isProtectedRoute(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}
```

**Key Points:**

- ⚡ Runs on Edge Runtime (~1ms per request)
- Only checks if cookie exists, doesn't validate it
- Provides fast UX redirect
- Not a security boundary

### Layer 2: Server Component Validation (`lib/auth/session.ts`)

**Purpose:** Real security with database validation

```typescript
// Protected page example
export default async function DashboardPage() {
  // This validates session with database via Hono API
  const user = await requireUser();

  return <div>Welcome {user.name}</div>;
}
```

**Available Auth Utilities:**

| Function            | Purpose                   | Redirects?     |
| ------------------- | ------------------------- | -------------- |
| `getSession()`      | Get session (may be null) | No             |
| `requireAuth()`     | Get session or redirect   | Yes → `/login` |
| `requireUser()`     | Get user or redirect      | Yes → `/login` |
| `requireRole(role)` | Check role or throw       | Throws error   |
| `isAuthenticated()` | Boolean check             | No             |

**Key Points:**

- ✅ This is where REAL security happens
- Validates session with database
- Calls Hono API server-to-server
- Cached per request (React `cache()`)

### Layer 3: Server Action Protection

**Purpose:** Protect mutations and form submissions

```typescript
// Server Action with auth check
'use server';

export async function deletePost(postId: string) {
  const session = await requireAuth();

  // Check permissions
  if (session.user.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  // Perform mutation
  await db.delete(posts).where(eq(posts.id, postId));
}
```

**Key Points:**

- Always validate auth in Server Actions
- Check roles/permissions before mutations
- CSRF protection is automatic

### Security Guarantees

| Attack Vector    | Layer 1        | Layer 2      | Layer 3      |
| ---------------- | -------------- | ------------ | ------------ |
| Cookie tampering | ❌ Bypassed    | ✅ Caught    | ✅ Caught    |
| Expired session  | ❌ Bypassed    | ✅ Caught    | ✅ Caught    |
| No cookie        | ✅ Blocked     | ✅ Blocked   | ✅ Blocked   |
| CSRF             | ❌ Not checked | ✅ Protected | ✅ Protected |
| Role bypass      | ❌ Not checked | ✅ Caught    | ✅ Caught    |

**Critical Insight:**

> "Middleware is NOT a security boundary - it's a UX optimization. Always validate in Server Components and Server Actions." - Better-Auth Documentation

## Examples in This Codebase

- ✅ **Invitation Acceptance** - `apps/web/src/app/accept-invite/[token]/`
  - Server Component validates token
  - Server Action handles submission
  - Small client form component for UX

- ✅ **Protected Dashboard** - `apps/web/src/app/dashboard/page.tsx`
  - Middleware optimistically redirects (Layer 1)
  - Server Component validates session (Layer 2)
  - Demonstrates proper auth pattern

- ✅ **Middleware** - `apps/web/src/middleware.ts`
  - Cookie-only optimistic check
  - Fast Edge Runtime execution
  - Preserves return URL

- ✅ **Auth Utilities** - `apps/web/src/lib/auth/session.ts`
  - Server-side validation helpers
  - Used in Server Components & Actions
  - Calls Hono API for validation

- ⚠️ **Login Page** - `apps/web/src/app/login/page.tsx`
  - Currently full client component (legacy pattern)
  - TODO: Refactor to Server-First pattern

## Migration Guide

### From Full Client Component to Server-First

1. **Extract data fetching** to Server Component
2. **Create Server Actions** for mutations
3. **Make form a Client Component** (only the form)
4. **Use `useActionState`** for progressive enhancement
5. **Move API calls** to `lib/api/` for reuse

See `apps/web/src/app/accept-invite/[token]/` as a reference implementation.

### Adding Authentication to a Page

```typescript
// Before: Unprotected page
export default function MyPage() {
  return <div>Content</div>;
}

// After: Protected page
import { requireUser } from "@/lib/auth/session";

export default async function MyPage() {
  const user = await requireUser(); // Redirects if not authenticated
  return <div>Content for {user.name}</div>;
}
```

### Adding Authorization to a Server Action

```typescript
// Before: Unprotected action
'use server';
export async function deleteItem(id: string) {
  await db.delete(items).where(eq(items.id, id));
}

// After: Protected action
('use server');
import { requireRole } from '@/lib/auth/session';

export async function deleteItem(id: string) {
  await requireRole('admin'); // Throws if not admin
  await db.delete(items).where(eq(items.id, id));
}
```

## Client-Side Auth State Management

### Architecture Decision: Minimal Client State

Following Server-First principles, we use a **minimal client-side state approach**:

1. **Session Data**: Better-Auth's built-in `useSession` hook (reactive, ~3KB bundle)
2. **Auth UI State**: Zustand for client-side interactivity only (~1KB bundle)
3. **Server State**: Server Components + Server Actions (no client bundle)

**Total Client Bundle**: ~4KB (vs ~16KB with TanStack Query approach)

### Performance Optimization: Cookie Cache

Better-Auth is configured with cookie caching for production scale:

```typescript
// apps/api/src/lib/auth.ts
session: {
  cookieCache: {
    enabled: true,
    maxAge: 5 * 60, // 5 minutes
    strategy: "jwe" // Encrypted (most secure)
  }
}
```

**Performance Impact (1M concurrent users)**:

- Without cache: ~16,667 DB queries/second
- With 5min cache: ~3,333 DB queries/second (**80% reduction**)

### State Management Layers

```
┌─────────────────────────────────────────────────────────┐
│ Client Components (use client)                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Better-Auth useSession Hook (Session Data)          │ │
│ │ - User data: session.user                           │ │
│ │ - Session info: session.session                     │ │
│ │ - Loading/error states                              │ │
│ │ - Built-in reactivity                               │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Zustand Store (UI State Only)                       │ │
│ │ - Multi-step form state                             │ │
│ │ - UI preferences (remember email)                   │ │
│ │ - Temporary modal/dialog state                      │ │
│ │ - NOT for session data                              │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Using the useAuth Hook

```typescript
"use client";
import { useAuth } from "@/lib/hooks/use-auth";

export function UserMenu() {
  const { user, isAuthenticated, isLoading, signOut } = useAuth();

  if (isLoading) return <Skeleton />;
  if (!isAuthenticated) return <SignInButton />;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage src={user.image} />
          <AvatarFallback>{user.name?.[0]}</AvatarFallback>
        </Avatar>
        {user.name}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={signOut}>
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### Using Auth UI Store (Zustand)

```typescript
"use client";
import { useAuthUI } from "@/lib/stores/auth-ui";

export function LoginForm() {
  const { rememberEmail, savedEmail, setRememberEmail } = useAuthUI();

  return (
    <form>
      <Input
        type="email"
        defaultValue={savedEmail ?? ""}
        placeholder="Email"
      />
      <Input type="password" placeholder="Password" />
      <Checkbox
        checked={rememberEmail}
        onCheckedChange={(checked) => setRememberEmail(checked)}
      >
        Remember me
      </Checkbox>
      <Button type="submit">Sign In</Button>
    </form>
  );
}
```

### What Goes Where?

| Data Type         | Storage                   | Example                                  |
| ----------------- | ------------------------- | ---------------------------------------- |
| User/Session Data | ✅ Better-Auth useSession | user.name, user.email, session.expiresAt |
| Auth Methods      | ✅ authClient             | signIn, signUp, signOut                  |
| UI Preferences    | ✅ Zustand (localStorage) | rememberEmail, savedEmail                |
| Multi-step Forms  | ✅ Zustand (memory)       | onboardingStep, show2FAModal             |
| Authorization     | ✅ Server Components      | requireRole, requirePermission           |
| Mutations         | ✅ Server Actions         | updateProfile, deleteAccount             |

### ❌ Anti-patterns

```typescript
// ❌ DON'T: Store session data in Zustand
const useAuthStore = create((set) => ({
  user: null, // ❌ Use Better-Auth useSession instead
  setUser: (user) => set({ user })
}));

// ❌ DON'T: Wrap Better-Auth with TanStack Query
const { data } = useQuery({
  queryKey: ['session'],
  queryFn: () => authClient.getSession() // ❌ Unnecessary wrapper
});

// ❌ DON'T: Fetch session in client component
useEffect(() => {
  fetch('/api/auth/get-session').then(...) // ❌ Use useAuth hook
}, []);
```

### ✅ Best Practices

```typescript
// ✅ DO: Use Better-Auth's useSession directly
import { useAuth } from "@/lib/hooks/use-auth";

export function Component() {
  const { user, isAuthenticated } = useAuth();
  // ...
}

// ✅ DO: Use Zustand for UI state only
import { useAuthUI } from "@/lib/stores/auth-ui";

export function OnboardingFlow() {
  const { onboardingStep, setOnboardingStep } = useAuthUI();
  // ...
}

// ✅ DO: Use Server Components for auth checks
import { requireUser } from "@/lib/auth/session";

export default async function ProfilePage() {
  const user = await requireUser(); // Server-side validation
  return <div>Welcome {user.name}</div>;
}
```

### Force Session Refresh (Bypass Cookie Cache)

When you need immediate session validation (e.g., after permission changes):

```typescript
"use client";
import { useAuth } from "@/lib/hooks/use-auth";

export function PermissionButton() {
  const { refetch } = useAuth();

  const handlePermissionChange = async () => {
    // ... update permissions via API

    // Force fresh validation from database (bypass 5min cookie cache)
    await refetch(true);
  };

  return <Button onClick={handlePermissionChange}>Update Permissions</Button>;
}
```

### SSR Pre-fetching (Advanced)

For optimal performance, pre-fetch session server-side:

```typescript
import { auth } from "@/lib/auth"; // Server-side auth instance
import { headers } from "next/headers";

export default async function Page() {
  // Pre-fetch session on server (no client-side fetch needed)
  const session = await auth.api.getSession({
    headers: await headers()
  });

  return <ClientComponent initialSession={session} />;
}
```

### Role-Based Component Guards

Client-side UI guards for conditional rendering based on user roles, client types, and permissions.

**⚠️ SECURITY WARNING**: These are UI helpers ONLY. Always validate authorization server-side.

**Available Components:**

| Component             | Purpose                           | Reference                                 |
| --------------------- | --------------------------------- | ----------------------------------------- |
| `<RequireRole>`       | Show/hide UI based on role        | `components/auth/require-role.tsx`        |
| `<RequireClientType>` | Show/hide UI based on client tier | `components/auth/require-client-type.tsx` |
| `<RequirePermission>` | Show/hide UI based on permissions | `components/auth/require-permission.tsx`  |

**Usage Pattern:**

```tsx
import { RequireRole } from '@/components/auth';

// Hide admin features from non-internal users
<RequireRole role="internal" fallback={<UpgradePrompt />}>
  <AdminSettingsButton />
</RequireRole>;
```

**Implementation Status:**

- ✅ RequireRole: Implemented (checks `is_internal` flag)
- ⚠️ RequireClientType: Component created, requires session extension
- ⚠️ RequirePermission: Component created, requires session extension

**TODO**: Extend session with client type and permissions using Better-Auth `customSession` plugin.

**Server-Side Authorization** (REAL security):

| Use Case          | Server Component                     | Server Action                        |
| ----------------- | ------------------------------------ | ------------------------------------ |
| Role check        | `requireRole("internal")`            | `requireRole("internal")`            |
| Permission check  | `requirePermission("projects:edit")` | `requirePermission("projects:edit")` |
| Client type check | Not yet implemented                  | Not yet implemented                  |

Reference: `apps/web/src/lib/auth/session.ts` for server-side utilities

## MDX Integration & Documentation Pages

### Overview

The application uses **@next/mdx** for rendering Markdown + JSX content in documentation pages like Help and Changelog. MDX enables rich, interactive documentation with React components embedded in markdown.

### Architecture

**Key Files:**

| File                    | Purpose                                  |
| ----------------------- | ---------------------------------------- |
| `mdx-components.tsx`    | Custom component styling for MDX content |
| `next.config.ts`        | MDX plugin configuration                 |
| `content/changelog/`    | MDX content files for changelog          |
| `components/changelog/` | Changelog page components                |
| `components/help/`      | Help documentation components            |

**Design Pattern:** 3-Column Layout

```
┌─────────────┬──────────────────────┬──────────────┐
│   Sidebar   │   MDX Content        │ Table of     │
│             │                      │ Contents     │
│  - Nav      │  - Rendered MDX      │              │
│  - Sections │  - Custom components │  - Auto-gen  │
│             │  - Styled markdown   │  - Scroll    │
└─────────────┴──────────────────────┴──────────────┘
```

### MDX Component Mapping

**File:** `apps/web/mdx-components.tsx`

All markdown elements are mapped to styled components using Tailwind CSS:

```typescript
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => <h1 className="mb-4 mt-8 scroll-mt-20 text-4xl...">{children}</h1>,
    h2: ({ children }) => <h2 className="mb-3 mt-6 scroll-mt-20 text-3xl...">{children}</h2>,
    // ... other elements
    ...components,
  };
}
```

**Key Features:**

- Responsive typography with Tailwind prose plugin
- Dark mode support via `dark:` variants
- Scroll offset (`scroll-mt-20`) for anchor navigation
- Consistent spacing and visual hierarchy

### Example: Changelog Page

**Route:** `/dashboard/changelog/[[...slug]]`

**Implementation:**

1. **MDX Content** - `content/changelog/index.mdx`
   - Unified changelog for entire monorepo
   - Organized by version and package
   - Keep a Changelog format

2. **Page Component** - `app/(default)/dashboard/changelog/[[...slug]]/page.tsx`

   ```typescript
   import { Changelog } from '@/components/changelog';
   import ChangelogMDX from '../../../../../../content/changelog/index.mdx';

   export default async function ChangelogPage() {
     return (
       <Changelog>
         <ChangelogMDX />
       </Changelog>
     );
   }
   ```

3. **Components** - `components/changelog/`
   - `index.tsx` - Main layout orchestrator (Server Component)
   - `sidebar.tsx` - Version navigation (Client Component)
   - `content.tsx` - MDX wrapper with prose styling
   - `table-of-contents.tsx` - Auto-generated TOC (Client Component)
   - `config.ts` - Navigation structure
   - `types.ts` - TypeScript interfaces

4. **Layout Override** - `app/(default)/dashboard/changelog/layout.tsx`

   ```typescript
   export default function ChangelogLayout({ children }) {
     return <div className="-m-4 flex h-full flex-col">{children}</div>;
   }
   ```

   - Removes default dashboard padding
   - Allows changelog to use full viewport

### Server-First MDX Pattern

**✅ Correct Pattern:**

```typescript
// Server Component (default)
import ContentMDX from './content.mdx';

export default function Page() {
  return (
    <article className="prose">
      <ContentMDX />
    </article>
  );
}
```

**❌ Anti-Pattern:**

```typescript
// Don't use 'use client' for MDX pages
'use client';
import ContentMDX from './content.mdx'; // ❌ Adds unnecessary client JS
```

### Next.js Configuration

**File:** `apps/web/next.config.ts`

```typescript
import createMDX from '@next/mdx';

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

export default withSentryConfig(withMDX(nextConfig), {
  // Sentry config...
});
```

**Important Notes:**

- **Turbopack Limitation**: remark-gfm plugin removed due to serialization issues
- **Future Enhancement**: Can add plugins when Next.js improves plugin serialization
- **Page Extensions**: `['js', 'jsx', 'md', 'mdx', 'ts', 'tsx']`

### Navigation Integration

**Files:**

- `config/navigation.ts` - Base navigation structure
- `config/navigation-with-icons.ts` - Icon assignments

**Example:**

```typescript
// 1. Define navigation item
export const changelogNavigation: NavigationItem = {
  title: 'Changelog',
  description: 'Release history and platform updates',
  url: '/dashboard/changelog',
};

// 2. Add to navigation group
export const generalGroup: NavigationGroup = {
  title: 'General',
  items: [settingsNavigation, searchNavigation, helpNavigation, changelogNavigation],
};

// 3. Add icon
const changelogWithIcons: NavigationItem = {
  ...changelogNavigation,
  icon: History, // from lucide-react
};
```

### Best Practices

1. **Content Organization**
   - Store MDX files in `content/` directory
   - Use meaningful directory structure
   - Keep content separate from components

2. **Component Styling**
   - Use `prose` utility classes for typography
   - Leverage Tailwind's built-in styles
   - Ensure dark mode compatibility

3. **Performance**
   - MDX compiles at build time (zero runtime cost)
   - Server Components by default (no client JS)
   - Static generation with `generateStaticParams()`

4. **Accessibility**
   - Semantic HTML from markdown
   - Proper heading hierarchy
   - Skip links via `scroll-mt-*` utilities

### References

- [Next.js MDX Documentation](https://nextjs.org/docs/app/building-your-application/configuring/mdx)
- [MDX Official Docs](https://mdxjs.com/)
- Implementation: `apps/web/src/components/changelog/`
- Implementation: `apps/web/src/components/help/`

## Business Center Dashboard

### Overview

The **Business Center** is an internal-only dashboard for agency team members to manage client work, team capacity, and project deliveries. It provides a comprehensive 6-section interface for operational oversight.

### Architecture

**Access Control:**

- **Server-Side**: Page protected with `requireUser()` + `isInternal` check
- **Client-Side**: Optional guard hook `useBusinessCenterAccess()` for client components
- **Route**: `/dashboard/business-center` (internal users only)

**Data Flow:**

```
┌──────────────────────────────────────────────────────────┐
│ Business Center Page (Server Component)                  │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ 1. Authenticate user (requireUser)                    │ │
│ │ 2. Verify internal status (isInternal check)          │ │
│ │ 3. Fetch all dashboard data from Hono API             │ │
│ │ 4. Pass data to BusinessCenter component              │ │
│ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│ BusinessCenter Component (Server Component)              │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Distributes data to 6 child components:               │ │
│ │ 1. IntakeQueue        - New client requests          │ │
│ │ 2. ActiveWorkContent  - Creative projects            │ │
│ │ 3. ActiveWorkSoftware - Development projects         │ │
│ │ 4. TeamCapacity       - Workload & availability      │ │
│ │ 5. DeliveryCalendar   - Upcoming delivery dates      │ │
│ │ 6. RecentlyCompleted  - Last 14 days deliveries      │ │
│ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│ Client Components (Interactive Elements)                 │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ - AssignModal: Assign tickets/projects to team       │ │
│ │ - CapacityModal: Update team member capacity         │ │
│ │ - AssignTrigger: Button to open assign modal         │ │
│ └──────────────────────────────────────────────────────┘ │
│ Uses Server Actions for mutations:                       │
│ - assignTicketAction, assignProjectAction               │
│ - updateCapacityAction, updateProjectStatusAction       │
└──────────────────────────────────────────────────────────┘
```

### 6-Section Dashboard Layout

**Grid Structure:** 3-column responsive grid (1 col mobile, 2 col tablet, 3 col desktop)

| Section                       | Purpose                                 | Data Source                                                                  | Key Features                                   |
| ----------------------------- | --------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------- |
| **1. Intake Queue**           | New client requests awaiting assignment | `intakeTickets[]`                                                            | Priority badges, assign to team member         |
| **2. Active Work - Content**  | Creative/media projects in production   | `activeProjects[]` filtered by `client.type === 'creative'`                  | Stage grouping (Pre/In/Post-Production)        |
| **3. Active Work - Software** | Software development projects           | `activeProjects[]` filtered by `client.type IN ('software', 'full_service')` | Stage grouping (Design/Dev/Test/Delivery)      |
| **4. Team Capacity**          | Team workload and availability          | `teamMembers[]`                                                              | Capacity %, status indicators, update capacity |
| **5. Delivery Calendar**      | Upcoming project delivery dates         | `upcomingDeliveries[]`                                                       | Grouped by date, multi-delivery warnings       |
| **6. Recently Completed**     | Projects delivered in last 14 days      | `recentlyCompleted[]`                                                        | Sorted by most recent first                    |

### Component Architecture

**File Structure:**

```
apps/web/src/components/business-center/
├── index.tsx                      # Main layout component
├── types.ts                       # Centralized type definitions
├── intake-queue.tsx               # Section 1 (Server Component)
├── active-work-content.tsx        # Section 2 (Server Component)
├── active-work-software.tsx       # Section 3 (Server Component)
├── team-capacity.tsx              # Section 4 (Server Component)
├── delivery-calendar.tsx          # Section 5 (Server Component)
├── recently-completed.tsx         # Section 6 (Server Component)
├── assign-modal.tsx               # Assignment modal (Client Component)
├── capacity-modal.tsx             # Capacity update modal (Client Component)
├── assign-trigger.tsx             # Button wrapper (Client Component)
├── use-business-center-access.ts  # Client-side guard hook
└── __tests__/                     # Component tests
    └── business-center.test.tsx
```

**Server Components (Data Display):**

- All section components are Server Components
- Receive props from parent BusinessCenter component
- Handle data filtering and grouping logic
- Display empty states when no data
- Use semantic color system from global CSS variables

**Client Components (Interactive Elements):**

- `assign-modal.tsx`: Generic assignment for tickets (single-select) or projects (multi-select)
- `capacity-modal.tsx`: Update team member capacity (0-200%)
- `assign-trigger.tsx`: Reusable button that opens AssignModal
- All use `useActionState` hook for Server Action integration

### Data Interface

**Type:** `BusinessCenterData`

```typescript
export interface BusinessCenterData {
  intakeTickets: TicketWithRelations[]; // New requests
  activeProjects: ProjectWithRelations[]; // In-progress projects
  teamMembers: TeamMember[]; // Team with capacity info
  upcomingDeliveries: ProjectWithRelations[]; // Future deliveries
  recentlyCompleted: ProjectWithRelations[]; // Last 14 days
}
```

**Key Type Extensions:**

```typescript
// Team member with capacity calculations
interface TeamMember {
  id: string;
  name: string;
  email: string;
  capacityPercentage: number; // 0-200%
  availableCapacity: number; // Calculated available %
  status: 'available' | 'at_capacity' | 'overloaded';
  projectCount: number;
  projects: TeamMemberProject[];
}

// Project with relationships
interface ProjectWithRelations extends Project {
  client: { id: string; name: string; type: string };
  assignees: ProjectAssignee[];
}
```

### Server Actions

**Location:** `apps/web/src/app/(default)/dashboard/business-center/actions.ts`

| Action                          | Purpose                  | Validation                      | Revalidation                 |
| ------------------------------- | ------------------------ | ------------------------------- | ---------------------------- |
| `createIntakeAction`            | Create new intake ticket | `createTicketSchema`            | `/dashboard/business-center` |
| `assignTicketAction`            | Assign ticket to user    | `assignTicketSchema`            | `/dashboard/business-center` |
| `assignProjectAction`           | Assign project to team   | `assignProjectSchema`           | `/dashboard/business-center` |
| `updateProjectStatusAction`     | Change project status    | `updateProjectStatusSchema`     | `/dashboard/business-center` |
| `updateProjectCompletionAction` | Update completion %      | `updateProjectCompletionSchema` | `/dashboard/business-center` |
| `updateCapacityAction`          | Update team capacity     | `updateCapacitySchema`          | `/dashboard/business-center` |

All actions follow the pattern:

1. Extract form data
2. Validate with Zod schema
3. Call Hono API function
4. Handle errors
5. Revalidate page cache
6. Return success/error response

### Stage Grouping Logic

**Content Projects (Creative/Media):**

| Stage           | Criteria                                   | Example                             |
| --------------- | ------------------------------------------ | ----------------------------------- |
| Pre-Production  | < 30% completion OR status === 'proposal'  | Concept development, script writing |
| In-Production   | 30-79% completion                          | Active filming, design work         |
| Post-Production | ≥ 80% completion OR status === 'in_review' | Editing, final review               |

**Software Projects (Development):**

| Stage       | Criteria                                    | Example                           |
| ----------- | ------------------------------------------- | --------------------------------- |
| Design      | < 20% completion OR status === 'proposal'   | Architecture planning, wireframes |
| Development | 20-69% completion                           | Active coding                     |
| Testing     | 70-94% completion OR status === 'in_review' | QA, bug fixes                     |
| Delivery    | ≥ 95% completion                            | Ready for deployment              |

### Capacity Management

**Capacity Levels:**

| Range  | Status      | Color  | Meaning                            |
| ------ | ----------- | ------ | ---------------------------------- |
| 0-79%  | Available   | Green  | Can take new work                  |
| 80-99% | At Capacity | Yellow | Fully allocated                    |
| 100%+  | Overloaded  | Red    | Over-committed (requires approval) |

**Capacity Modal:**

- Range: 0-200% (5% increments)
- Warning shown for 100%+ assignments
- Guidelines displayed in modal
- Server validation enforces range

### Testing

**Test Coverage:**

1. **Backend Unit Tests** (`apps/web/src/app/(default)/dashboard/business-center/__tests__/actions.test.ts`)
   - All 6 server actions
   - Validation error handling
   - API error handling
   - Revalidation calls

2. **Frontend Component Tests** (`apps/web/src/components/business-center/__tests__/business-center.test.tsx`)
   - Main component rendering
   - All 6 sections present
   - Empty state displays

3. **E2E Playwright Tests** (`apps/web/e2e/business-center.spec.ts`)
   - Page accessibility (auth required, internal only)
   - All sections visible
   - Modal interactions
   - Form submissions
   - Capacity updates
   - Assignment workflows

### Design Patterns

**Global CSS Variables:**

- Uses semantic color system from `apps/web/src/app/globals.css`
- Colors: `success`, `warning`, `error`, `info`, `primary`, `muted`
- Opacity modifiers: `/10`, `/20`, `/50` for backgrounds

**Empty States:**

- Consistent pattern across all sections
- Icon + primary message + secondary hint
- Uses `text-muted-foreground` for subdued appearance

**Server-First Architecture:**

- All data fetching on server
- Client components only for interactivity
- `useActionState` for form handling
- Optimistic UI updates via revalidation

### Access Control Best Practices

```typescript
// ✅ DO: Server-side protection (page.tsx)
export default async function BusinessCenterPage() {
  const user = await requireUser();

  if (!user.isInternal) {
    redirect('/dashboard');
  }

  // ... fetch data and render
}

// ✅ DO: Client guard for UX optimization (optional)
function MyClientComponent() {
  const { hasAccess } = useBusinessCenterAccess();
  if (!hasAccess) return null;
  // ... render
}

// ❌ DON'T: Rely only on client-side checks
// Server Components are the security boundary
```

### Performance Optimizations

1. **Server Components by Default**
   - Minimal client JavaScript
   - Only modals and triggers are client components

2. **Request Caching**
   - `getSession()` cached per request via React `cache()`
   - Prevents multiple auth checks per render

3. **Data Filtering**
   - Each section filters its own data
   - Shared `activeProjects` array filtered by client type

4. **Revalidation Strategy**
   - All mutations revalidate `/dashboard/business-center`
   - Ensures fresh data after actions

### Future Enhancements

**Planned Features:**

- Real-time updates via WebSocket
- Advanced filtering and search
- Bulk assignment operations
- Capacity forecasting
- Historical analytics
- Export to CSV/PDF

**Technical Debt:**

- Add comprehensive error boundaries
- Implement loading skeletons
- Add retry logic for failed actions
- Optimize large dataset rendering

### References

- Implementation: `apps/web/src/components/business-center/`
- Server Actions: `apps/web/src/app/(default)/dashboard/business-center/actions.ts`
- Page Component: `apps/web/src/app/(default)/dashboard/business-center/page.tsx`
- Type Definitions: `apps/web/src/components/business-center/types.ts`
- Tests: `apps/web/e2e/business-center.spec.ts`
