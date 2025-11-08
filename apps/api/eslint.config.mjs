import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import turboConfig from 'eslint-config-turbo/flat';

const eslintConfig = [
  ...turboConfig,
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'drizzle/**',
      '.turbo/**',
      // CommonJS utility scripts and config files
      '*.config.js',
      'drizzle.config.js',
      'vitest.config.js',
      'check-users.js',
      'update-admin-user.js',
      'update-user-internal.js',
      'scripts/**/*.js',
    ],
  },
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      // Custom rules
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];

export default eslintConfig;
