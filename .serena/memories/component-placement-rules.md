# Component Placement Rules (CRITICAL)

## Summary

This memory documents the critical component placement rules for the Next.js web
app. These rules MUST be followed for all future development.

## The Rule

**NEVER place components in the `app/` directory.**

- The `app/` directory is ONLY for routing files: `page.tsx`, `layout.tsx`,
  `loading.tsx`, `error.tsx`
- ALL client components, forms, cards, dialogs go in `src/components/`
- The component directory structure MUST mirror the app route structure

## The Pattern

```
App Route:       app/(default)/dashboard/{section}/{feature}/page.tsx
Components:      src/components/dashboard/{section}/{feature}/*.tsx
```

## Examples

| App Route                                           | Component Location                               |
| --------------------------------------------------- | ------------------------------------------------ |
| `app/(default)/dashboard/business-center/intake/`   | `components/dashboard/business-center/intake/`   |
| `app/(default)/dashboard/business-center/projects/` | `components/dashboard/business-center/projects/` |
| `app/(default)/dashboard/overview/`                 | `components/dashboard/overview/`                 |

## What Goes Where

| Location                        | Contents                                       |
| ------------------------------- | ---------------------------------------------- |
| `app/**/page.tsx`               | ONLY Server Components that render the page    |
| `app/**/layout.tsx`             | Layout components (if needed)                  |
| `components/dashboard/**/*.tsx` | ALL client components, forms, cards, dialogs   |
| `components/ui/*.tsx`           | Reusable shadcn/ui components                  |
| `lib/`                          | Utilities, hooks, stores, schemas, API clients |

## ❌ WRONG - NEVER Do This

```
app/.../intake/client.tsx           # ❌ WRONG
app/.../intake/components/          # ❌ WRONG
app/.../intake/request-card.tsx     # ❌ WRONG
```

## ✅ CORRECT

```
app/.../intake/page.tsx                              # ✅ Only page.tsx
components/dashboard/business-center/intake/         # ✅ All components here
├── intake-client.tsx
├── request-card.tsx
├── estimation-form.tsx
└── index.ts
```

## Key Principle

If uncertain about where to place a component, ASK the user - do NOT assume.

## References

- `apps/web/ARCHITECTURE.md` → "Component Directory Structure (Critical)"
- `CLAUDE.md` → "CRITICAL RULE - Component Placement"
