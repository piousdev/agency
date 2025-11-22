import { defineConfig, mergeConfig } from 'vitest/config';
import { resolve } from 'path';
import sharedConfig from '../../vitest.shared';

/**
 * Vitest configuration for API package
 * Extends shared config with Node.js/Hono-specific settings
 */
export default mergeConfig(
  sharedConfig,
  defineConfig({
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    test: {
      name: '@repo/api',
      environment: 'node',
      setupFiles: ['./src/test/setup.ts'],
    },
  })
);
