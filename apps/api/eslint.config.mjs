import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import turboConfig from 'eslint-config-turbo/flat';
import prettierConfig from 'eslint-config-prettier';
import importX from 'eslint-plugin-import-x';
import security from 'eslint-plugin-security';
import promise from 'eslint-plugin-promise';
import nodePlugin from 'eslint-plugin-n';
import globals from 'globals';

/**
 * ESLint Configuration for Node.js API (Hono + TypeScript)
 *
 * This configuration enforces:
 * - Strict TypeScript type-checking
 * - Node.js best practices
 * - Security best practices (critical for APIs)
 * - Import organization and sorting
 * - Promise handling patterns
 */
const eslintConfig = tseslint.config(
  // Base configurations
  js.configs.recommended,
  ...turboConfig,

  // TypeScript strict type-checked configuration
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // Global ignores
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      'drizzle/**',
      '.turbo/**',
      '*.config.js',
      '*.config.cjs',
      '*.config.mjs',
      '*.config.ts',
      'drizzle.config.js',
      'drizzle.config.ts',
      'vitest.config.js',
      'vitest.config.ts',
      'check-users.js',
      'check-users.ts',
      'update-admin-user.js',
      'update-user-internal.js',
      'update-user-internal.ts',
      'scripts/**/*.js',
      'scripts/**/*.ts',
      'verify-tickets.js',
      'verify-tickets.ts',
      // Test files - not included in tsconfig for type-aware linting
      '**/__tests__/**',
      '**/*.test.ts',
      '**/*.spec.ts',
    ],
  },

  // TypeScript parser options for type-aware linting
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
  },

  // Node.js specific rules
  {
    files: ['**/*.{js,ts}'],
    plugins: {
      n: nodePlugin,
    },
    rules: {
      // Node.js best practices
      'n/no-deprecated-api': 'error',
      'n/no-missing-import': 'off', // TypeScript handles this
      'n/no-missing-require': 'off', // TypeScript handles this
      'n/no-unpublished-import': 'off', // We use dev dependencies
      'n/no-unpublished-require': 'off',
      'n/no-extraneous-import': 'off', // TypeScript handles this
      'n/no-extraneous-require': 'off',
      'n/no-process-exit': 'error',
      'n/no-sync': 'warn', // Warn on sync methods in async context
      'n/handle-callback-err': 'error',
      'n/callback-return': 'error',
      'n/prefer-promises/dns': 'error',
      'n/prefer-promises/fs': 'error',
    },
  },

  // Import organization rules
  {
    files: ['**/*.{js,ts}'],
    plugins: {
      'import-x': importX,
    },
    settings: {
      'import-x/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      // Import organization
      'import-x/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling'],
            'index',
            'object',
            'type',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
              position: 'before',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin', 'type'],
        },
      ],
      'import-x/no-duplicates': 'error',
      'import-x/no-unresolved': 'off', // TypeScript handles this
      'import-x/first': 'error',
      'import-x/newline-after-import': 'error',
      'import-x/no-mutable-exports': 'error',
      'import-x/no-cycle': 'error', // Stricter for API - circular deps are dangerous
      'import-x/no-self-import': 'error',
    },
  },

  // Security rules (stricter for API)
  {
    files: ['**/*.{js,ts}'],
    plugins: {
      security,
    },
    rules: {
      // All security rules at error level for API
      'security/detect-object-injection': 'warn',
      'security/detect-non-literal-regexp': 'error',
      'security/detect-unsafe-regex': 'error',
      'security/detect-buffer-noassert': 'error',
      'security/detect-eval-with-expression': 'error',
      'security/detect-no-csrf-before-method-override': 'error',
      'security/detect-possible-timing-attacks': 'error',
      'security/detect-pseudoRandomBytes': 'error',
      'security/detect-child-process': 'warn',
      'security/detect-disable-mustache-escape': 'error',
      'security/detect-new-buffer': 'error',
      'security/detect-non-literal-fs-filename': 'warn',
      'security/detect-non-literal-require': 'warn',
    },
  },

  // Promise handling rules
  {
    files: ['**/*.{js,ts}'],
    plugins: {
      promise,
    },
    rules: {
      'promise/always-return': 'error',
      'promise/no-return-wrap': 'error',
      'promise/param-names': 'error',
      'promise/catch-or-return': 'error',
      'promise/no-nesting': 'warn',
      'promise/no-promise-in-callback': 'warn',
      'promise/no-callback-in-promise': 'warn',
      'promise/no-return-in-finally': 'error',
      'promise/valid-params': 'error',
      'promise/prefer-await-to-then': 'error', // Prefer async/await
      'promise/prefer-await-to-callbacks': 'warn',
    },
  },

  // TypeScript specific rules
  {
    files: ['**/*.ts'],
    rules: {
      // Strict TypeScript rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
        },
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/strict-boolean-expressions': [
        'error',
        {
          allowString: true,
          allowNumber: true,
          allowNullableObject: true,
          allowNullableBoolean: false,
          allowNullableString: false,
          allowNullableNumber: false,
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],
      '@typescript-eslint/consistent-type-exports': [
        'error',
        { fixMixedExportsWithInlineTypeSpecifier: true },
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'interface',
          format: ['PascalCase'],
        },
        {
          selector: 'typeAlias',
          format: ['PascalCase'],
        },
        {
          selector: 'enum',
          format: ['PascalCase'],
        },
        {
          selector: 'enumMember',
          format: ['UPPER_CASE', 'PascalCase'],
        },
      ],

      // API-specific strict rules
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/return-await': ['error', 'always'], // Always return await for proper stack traces
    },
  },

  // Route handlers (Hono)
  {
    files: ['**/routes/**/*.ts', '**/middleware/**/*.ts'],
    rules: {
      // Allow slightly relaxed rules for route handlers
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },

  // Database/ORM files
  {
    files: ['**/db/**/*.ts', '**/schema/**/*.ts'],
    rules: {
      // Drizzle ORM patterns
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },

  // Test files
  {
    files: ['**/*.test.ts', '**/*.spec.ts', '**/__tests__/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/require-await': 'off',
      'security/detect-object-injection': 'off',
      'security/detect-non-literal-fs-filename': 'off',
    },
  },

  // Scripts and config files
  {
    files: ['*.config.{js,mjs,ts}', 'scripts/**/*.ts', '**/scripts/**/*.ts'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'n/no-process-exit': 'off', // Scripts may exit
      'security/detect-child-process': 'off',
    },
  },

  // Seed and migration files
  {
    files: ['**/seed.ts', '**/migrate.ts', '**/migrations/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      'n/no-process-exit': 'off',
      'security/detect-non-literal-fs-filename': 'off',
    },
  },

  // Prettier config - MUST be last to disable conflicting rules
  prettierConfig
);

export default eslintConfig;
