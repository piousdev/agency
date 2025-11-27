import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig, mergeConfig } from 'vitest/config';

import sharedConfig from '../../vitest.shared';

/**
 * Vitest configuration for Web package
 * Extends shared config with Next.js/React-specific settings
 */
export default mergeConfig(
  sharedConfig,
  defineConfig({
    plugins: [react()],
    test: {
      name: '@repo/web',
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      // Exclude Playwright E2E tests - they run separately with `pnpm test:e2e`
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/cypress/**',
        '**/.{idea,git,cache,output,temp}/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*',
        '**/e2e/**/*.spec.ts', // Playwright E2E tests in e2e/ directory
        '**/tests/e2e/**/*.spec.ts', // Playwright E2E tests
        '**/tests/**/*.spec.ts', // All Playwright spec files
        '**/components/ui/**', // Third-party shadcn/ui components
      ],
      coverage: {
        exclude: [
          '**/components/ui/**', // Third-party shadcn/ui components
        ],
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  })
);
