'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var config_1 = require('vitest/config');
var vitest_shared_1 = require('../../vitest.shared');
/**
 * Vitest configuration for API package
 * Extends shared config with Node.js/Hono-specific settings
 */
exports.default = (0, config_1.mergeConfig)(
  vitest_shared_1.default,
  (0, config_1.defineConfig)({
    test: {
      name: '@repo/api',
      environment: 'node',
      setupFiles: ['./src/test/setup.ts'],
    },
  })
);
