# Skyll Platform Web

Frontend web application for the Skyll Platform, built with Next.js 16, React
19, Tailwind CSS v4, and TypeScript.

## 🎯 Overview

The web application provides:

- **Client Portal** - Interface for external clients
- **Admin Dashboard** - Management interface for internal team
- **Authentication UI** - Login, signup, invitation acceptance
- **Project Management** - View and manage projects
- **Service Requests** - Submit and track service requests
- **Responsive Design** - Mobile-first, fully responsive

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         Next.js 16 App Router            │
│  - Server Components (default)           │
│  - Client Components (with 'use client') │
│  - Route Groups for organization         │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│          State Management                │
│  - Zustand (client state)                │
│  - TanStack Query (server state)         │
│  - React Context (auth, theme)           │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│        UI Component Layer                │
│  - React 19 components                   │
│  - Tailwind CSS v4 styling               │
│  - shadcn/ui components (future)         │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│         API Communication                │
│  - BetterAuth client                     │
│  - Fetch/TanStack Query                  │
│  - Type-safe with Hono RPC (future)      │
└─────────────────────────────────────────┘
```

## 🚀 Tech Stack

- **Framework:** Next.js 16.0.1 (App Router)
- **UI Library:** React 19.0.0
- **Language:** TypeScript v5.1.0
- **Styling:** Tailwind CSS v4.1.17
- **State Management:** Zustand + TanStack Query
- **Forms:** React Hook Form + Zod v4.1.12
- **Auth:** BetterAuth React client
- **Testing:** Vitest (unit) + Playwright (E2E)

## 📂 Project Structure

```
apps/web/
├── src/
│   ├── app/                     # App Router
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Home page
│   │   ├── globals.css          # Global styles
│   │   ├── api/                 # API routes
│   │   │   └── auth/            # Auth proxy
│   │   ├── (auth)/              # Route group: auth pages
│   │   │   ├── login/
│   │   │   └── signup/
│   │   └── (dashboard)/         # Route group: protected pages
│   │       └── dashboard/
│   │
│   ├── components/              # React components
│   │   ├── ui/                  # UI primitives (future)
│   │   └── ...
│   │
│   ├── lib/                     # Utilities
│   │   ├── auth-client.ts       # BetterAuth client
│   │   └── utils.tsx             # Helper functions
│   │
│   └── styles/                  # Additional styles (if needed)
│
├── public/                      # Static assets
│   ├── favicon.ico
│   └── ...
│
├── tests/
│   └── e2e/                     # Playwright E2E tests
│       └── home.spec.ts
│
├── Dockerfile                   # Production container
├── fly.toml                     # Fly.io deployment config
├── next.config.ts               # Next.js configuration
├── tailwind.config.ts           # Tailwind configuration
├── postcss.config.mjs           # PostCSS configuration
├── package.json
├── tsconfig.json
├── vitest.config.ts             # Unit test config
└── playwright.config.ts         # E2E test config
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ LTS
- pnpm 9.0.0
- Running API server (apps/api)

### Installation

```bash
# From project root
pnpm install

# Or from this directory
pnpm install
```

### Environment Variables

Create `.env` file (use `.env.example` as template):

```bash
# API
NEXT_PUBLIC_API_URL="http://localhost:8000"

# Better Auth
BETTER_AUTH_SECRET="same-as-api-secret"
BETTER_AUTH_URL="http://localhost:3000"
```

**Important:** `NEXT_PUBLIC_*` variables are exposed to the browser.

### Development

```bash
# Start dev server with Turbopack
pnpm dev

# Server runs on http://localhost:3000
```

Visit http://localhost:3000 to see the app.

## 🎨 Styling

### Tailwind CSS v4

Using the latest Tailwind CSS v4 with PostCSS plugin:

```typescript
// postcss.config.mjs
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

### Using Tailwind Classes

```tsx
export default function Component() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-blue-600">Hello, Skyll!</h1>
    </div>
  );
}
```

### Custom Styles

Global styles in `src/app/globals.css`:

```css
@import 'tailwindcss';

:root {
  --foreground-rgb: 0, 0, 0;
  --background-rgb: 255, 255, 255;
}

body {
  color: rgb(var(--foreground-rgb));
  background: rgb(var(--background-rgb));
}
```

## 🔐 Authentication

### BetterAuth Client

Located in `src/lib/auth-client.ts`:

```typescript
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export const { signIn, signUp, signOut, useSession } = authClient;
```

### Usage in Components

```tsx
'use client';

import { useSession, signOut } from '@/lib/auth-client';

export default function Profile() {
  const { data: session, isPending } = useSession();

  if (isPending) return <div>Loading...</div>;
  if (!session) return <div>Not logged in</div>;

  return (
    <div>
      <h1>Welcome, {session.user.name}</h1>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

### Protected Routes (Future)

Using middleware:

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check auth status
  const session = request.cookies.get('better-auth.session_token');

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/dashboard/:path*',
};
```

## 📝 Forms

### React Hook Form + Zod

```tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type FormData = z.infer<typeof schema>;

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    // Handle login
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} type="email" />
      {errors.email && <p>{errors.email.message}</p>}

      <input {...register('password')} type="password" />
      {errors.password && <p>{errors.password.message}</p>}

      <button type="submit">Login</button>
    </form>
  );
}
```

## 🗂️ State Management

### Zustand (Client State)

```typescript
// src/stores/ui-store.ts
import { create } from 'zustand';

interface UIStore {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
```

Usage:

```tsx
'use client';

import { useUIStore } from '@/stores/ui-store';

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <div className={sidebarOpen ? 'block' : 'hidden'}>
      {/* Sidebar content */}
    </div>
  );
}
```

### TanStack Query (Server State)

```typescript
// src/lib/queries.ts
import { useQuery } from '@tanstack/react-query';

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`);
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json();
    },
  });
}
```

Usage:

```tsx
'use client';

import { useProjects } from '@/lib/queries';

export default function ProjectsList() {
  const { data, isLoading, error } = useProjects();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data.map((project) => (
        <li key={project.id}>{project.name}</li>
      ))}
    </ul>
  );
}
```

## 🧪 Testing

### Unit Tests (Vitest)

```bash
# Run all tests
pnpm test

# Run in watch mode
pnpm test:watch

# Run with UI
pnpm test:ui

# Generate coverage
pnpm test:coverage
```

Example test:

```typescript
// src/components/__tests__/Button.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Button from '../Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### E2E Tests (Playwright)

```bash
# Run E2E tests
pnpm test:e2e

# Run with UI
pnpm test:e2e:ui

# Debug mode
pnpm test:e2e:debug
```

Example E2E test:

```typescript
// tests/e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test('user can login', async ({ page }) => {
  await page.goto('/login');

  await page.fill('input[type="email"]', 'user@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/dashboard');
});
```

## 🛠️ Development

### Available Scripts

```bash
pnpm dev              # Start dev server with Turbopack
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Lint code
pnpm test             # Run unit tests
pnpm test:watch       # Run tests in watch mode
pnpm test:ui          # Run tests with UI
pnpm test:coverage    # Generate coverage report
pnpm test:e2e         # Run E2E tests
pnpm test:e2e:ui      # Run E2E tests with UI
pnpm test:e2e:debug   # Debug E2E tests

# Deployment
pnpm deploy           # Deploy to Fly.io
pnpm fly:launch       # Initialize Fly.io app
pnpm fly:status       # Check deployment status
pnpm fly:logs         # View logs
pnpm fly:ssh          # SSH into container
```

### Adding New Pages

1. Create page in `src/app/`:

```typescript
// src/app/about/page.tsx
export default function AboutPage() {
  return <h1>About Skyll Platform</h1>;
}
```

2. Access at `/about`

### Adding New Components

```typescript
// src/components/Card.tsx
interface CardProps {
  title: string;
  children: React.ReactNode;
}

export default function Card({ title, children }: CardProps) {
  return (
    <div className="border rounded-lg p-4 shadow">
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="mt-2">{children}</div>
    </div>
  );
}
```

### API Routes

Create API routes for server-side logic:

```typescript
// src/app/api/hello/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Hello from Next.js API!' });
}
```

Access at `/api/hello`

## 🚢 Deployment

See **[../../DEPLOYMENT.md](../../DEPLOYMENT.md)** for complete deployment
guide.

Quick deploy:

```bash
# From this directory
pnpm deploy

# Or from root
pnpm deploy:web
```

### Environment Variables (Production)

Set via Fly.io CLI:

```bash
fly secrets set BETTER_AUTH_SECRET="your-secret"
fly secrets set BETTER_AUTH_URL="https://your-web-app.fly.dev"

# Build-time variables (NEXT_PUBLIC_*)
# Set during deployment:
fly deploy --build-arg NEXT_PUBLIC_API_URL="https://your-api-app.fly.dev"
```

### Build Output

Next.js is configured with `output: "standalone"` for optimized Docker
deployments:

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  output: 'standalone', // Reduces image size
};
```

This creates `.next/standalone/` with only necessary files.

## 🐛 Troubleshooting

### Hydration Errors

```bash
# Check for:
# - Mismatched HTML between server and client
# - useEffect with state changes on mount
# - Browser extensions modifying DOM
```

### Build Failures

```bash
# Clear Next.js cache
rm -rf .next/

# Rebuild
pnpm build
```

### Environment Variable Issues

```bash
# Verify variables are set
node -e "console.log(process.env.NEXT_PUBLIC_API_URL)"

# Remember: NEXT_PUBLIC_* are build-time variables
# Changing them requires a rebuild
```

### API Connection Issues

```bash
# Check API is running
curl http://localhost:8000/health

# Check CORS in API
# origin should match web app URL
```

## 📚 Resources

- **Next.js 16:** https://nextjs.org/docs
- **React 19:** https://react.dev
- **Tailwind CSS v4:** https://tailwindcss.com/blog/tailwindcss-v4-alpha
- **BetterAuth:** https://better-auth.com
- **React Hook Form:** https://react-hook-form.com
- **Zod:** https://zod.dev
- **TanStack Query:** https://tanstack.com/query

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Add tests
4. Run `pnpm lint` and `pnpm test`
5. Create pull request

## 📝 License

ISC

---

**Last Updated:** 2025-11-07 **Next.js:** 16.0.1 | **React:** 19.0.0
