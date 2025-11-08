import { defineConfig } from 'vitest/config';

/**
 * Shared Vitest configuration for all packages in the monorepo
 * Each package extends this config with package-specific settings
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.next/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/*.config.{js,ts}',
        '**/.next/**',
        '**/coverage/**',
      ],
    },
  },
});
