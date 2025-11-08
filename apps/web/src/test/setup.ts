/**
 * Vitest test setup for Web package
 * Runs before all tests to configure the testing environment
 */

import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

// Mock Next.js modules that don't work well in test environment
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
  // redirect throws an error in Next.js to stop execution
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT: ${url}`);
  }),
}));

// Mock Next.js headers
vi.mock('next/headers', () => ({
  headers: vi.fn(),
  cookies: vi.fn(),
}));

// Setup global fetch mock
global.fetch = vi.fn();

// Environment variables for testing
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:4000';
