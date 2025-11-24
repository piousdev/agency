<!-- OPENSPEC:START -->

# OpenSpec Instructions

You MUST always use the AskUserQuestion tool with multiple choice options when asking ANY questions. This is mandatory for speed and accuracy. Always include a "Type custom response" option for questions requiring additional context or nuance.

These instructions are for AI assistants working in this project.

# MCP Servers - When to Use

## **jetbrains**

**Use when:** Working with JetBrains IDEs (WebStorm, IntelliJ, etc.)

- Navigating project files and code structure
- Refactoring code within the IDE
- Running IDE-specific commands
- Accessing project configurations and settings
- Integrating AI assistance directly into the development environment

## **serena**

**Use when:** Managing project context and documentation

- Maintaining project memory across sessions
- Storing and retrieving project-specific knowledge
- Managing architectural decisions and patterns
- Keeping track of conventions and standards
- Building institutional knowledge for the codebase

## **context7**

**Use when:** Handling broader codebase context

- Analyzing large-scale code relationships
- Understanding cross-file dependencies
- Getting holistic views of your architecture
- Searching across multiple repositories or projects
- Maintaining context for complex, multiservice systems

## **chrome-devtools**

**Use when:** Debugging web applications in real-time

- Inspecting DOM elements and styles
- Monitoring network requests and responses
- Debugging JavaScript in the browser
- Analyzing performance and runtime behavior
- Testing responsive designs and mobile views

## **playwright**

**Use when:** Automating browser testing and interactions

- Writing end-to-end tests
- Automating repetitive browser tasks
- Testing across multiple browsers (Chrome, Firefox, Safari)
- Capturing screenshots and videos for debugging
- Simulating user interactions programmatically

---

**Typical Workflow Integration:**

- **jetbrains** for day-to-day coding in your IDE
- **chrome-devtools** for debugging Next.js/React applications
- **playwright** for automated testing of client projects
- **serena/context7** for maintaining project knowledge as your agency scales

CRITICAL RULE - Documentation First:
Before providing implementation advice for any framework, library, or tool:

1. Use Context7 to fetch the current official documentation
2. Never rely solely on training data for framework-specific patterns
3. If you're unsure whether docs have changed, default to checking

Trigger this rule when:

- User asks about "best practices" or "recommended approach"
- User mentions specific framework versions (Next.js, React, etc.)
- Implementation involves third-party libraries or APIs
- You detect potential outdated patterns in your knowledge

Exception: Only skip doc check for truly stable, fundamental concepts
(e.g., JavaScript fundamentals, HTTP basics) that are unlikely to change.

Always use context7 when I need code generation, setup or configuration steps, or
library/API documentation. This means you should automatically use the Context7 MCP
tools to resolve library id and get library docs without me having to explicitly ask.

CRITICAL RULE - Architecture First (Next.js Web App):
Before implementing ANY feature in the apps/web directory:

1. **ALWAYS** read `apps/web/ARCHITECTURE.md` first
2. Follow Server-First principles strictly:
   - Server Components by default (no "use client" unless needed)
   - Server Actions for mutations (not client-side fetch)
   - Client components ONLY for interactivity
   - Use provided auth patterns (Better-Auth + Zustand)
3. Reference ARCHITECTURE.md examples before writing code

Trigger this rule when:

- Implementing features in apps/web/
- Creating new pages, components, or forms
- Working with authentication or state management
- User asks about "best practices" for the web app

**Key Architecture Decisions**:

- Session data: Better-Auth useSession (NOT Zustand or TanStack Query)
- UI state only: Zustand for client preferences/forms
- Auth checks: Server Components with requireUser/requireAuth
- Mutations: Server Actions with auth validation
- Cookie cache: 5min for 80% DB load reduction at scale

Always open `@/openspec/AGENTS.md` when the request:

- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:

- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

CRITICAL RULE - Component Placement (NEVER in app/):
Before creating ANY client components, forms, or UI elements:

1. **NEVER** place components in the `app/` directory
2. **NEVER** create `components/` folders inside `app/` routes
3. **NEVER** create `client.tsx` files in `app/` routes
4. **ONLY** `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` belong in `app/`

**The Pattern**:

```
App Route:       app/(default)/dashboard/{section}/{feature}/page.tsx
Components:      src/components/dashboard/{section}/{feature}/*.tsx
```

**Examples**:
| Route | Components Location |
|-------|---------------------|
| `app/.../intake/page.tsx` | `components/dashboard/business-center/intake/` |
| `app/.../projects/page.tsx` | `components/dashboard/business-center/projects/` |
| `app/.../overview/page.tsx` | `components/dashboard/overview/` |

**❌ WRONG (NEVER do this)**:

```
app/.../intake/client.tsx           # ❌ WRONG
app/.../intake/components/          # ❌ WRONG
app/.../intake/request-card.tsx     # ❌ WRONG
```

**✅ CORRECT**:

```
app/.../intake/page.tsx                              # ✅ Only page.tsx in app/
components/dashboard/business-center/intake/         # ✅ All components here
├── intake-client.tsx
├── request-card.tsx
└── index.ts
```

**Trigger this rule when**:

- Creating new pages or features
- Adding client components to a route
- User asks to "add a component" to a page

**If uncertain**: ASK the user, do NOT assume.

**Reference**: See `apps/web/ARCHITECTURE.md` → "Component Directory Structure (Critical)" for complete rules.

CRITICAL RULE - File Naming Conventions:
Before creating ANY new files or components:

1. **ALWAYS** follow the naming conventions in `apps/web/ARCHITECTURE.md` (File Naming Conventions section)
2. **Use kebab-case** for all filenames (e.g., `login-form.tsx`, `validate-password.ts`)
3. **Avoid adjectives** - No "enhanced-", "custom-", "advanced-" prefixes
4. **Leverage directory context** - Don't repeat parent directory names in filenames

Trigger this rule when:

- Creating new components, hooks, utilities, or any source files
- User asks to "create a file" or "add a component"
- Implementing new features that require new files

**Key Naming Rules**:

- Components: Use nouns (e.g., `form.tsx`, `table.tsx`, not `users-table.tsx` in /users/)
- Hooks: Use "use-" prefix + verb (e.g., `use-auth.ts`, not `use-auth-hook.ts`)
- Utilities: Use verbs for actions (e.g., `validate-password.ts`, not `password-validation.ts`)
- Actions: Use verbs (e.g., `handle-errors.ts`, not `error-handler.ts`)

**Reference**: See `apps/web/ARCHITECTURE.md` → "File Naming Conventions" for complete rules and examples.

CRITICAL RULE - Package Manager (pnpm):
This project uses **pnpm**, NOT npm or npx. NEVER use npx.

**Correct Usage:**

```bash
# Root level scripts
pnpm build
pnpm lint
pnpm test

# Workspace-specific scripts
pnpm --filter @repo/api dev
pnpm --filter @repo/web dev
pnpm --filter @repo/api db:generate
pnpm --filter @repo/api db:migrate
pnpm --filter @repo/api db:seed

# Running binaries (instead of npx)
pnpm exec drizzle-kit generate
pnpm exec tsx script.ts
```

**WRONG - Never do this:**

```bash
npx drizzle-kit generate  # ❌ WRONG
npx tsx script.ts         # ❌ WRONG
npm install               # ❌ WRONG
```

**Available API Database Scripts:**

- `pnpm --filter @repo/api db:generate` - Generate Drizzle migrations
- `pnpm --filter @repo/api db:migrate` - Run Drizzle migrations
- `pnpm --filter @repo/api db:push` - Push schema changes directly
- `pnpm --filter @repo/api db:studio` - Open Drizzle Studio
- `pnpm --filter @repo/api db:seed` - Seed the database
