import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import turboConfig from 'eslint-config-turbo/flat';
import nextConfig from 'eslint-config-next/core-web-vitals';
import prettierConfig from 'eslint-config-prettier';
import importX from 'eslint-plugin-import-x';
import security from 'eslint-plugin-security';
import promise from 'eslint-plugin-promise';
import globals from 'globals';

/**
 * ESLint Configuration for Next.js 16 + React 19 + TypeScript
 *
 * This configuration enforces:
 * - Strict TypeScript type-checking
 * - React best practices and hooks rules
 * - Accessibility (a11y) standards
 * - Import organization and sorting
 * - Security best practices
 * - Promise handling patterns
 */
const eslintConfig = tseslint.config(
  // Base configurations
  js.configs.recommended,
  ...turboConfig,
  ...nextConfig,

  // TypeScript strict type-checked configuration
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // Global ignores
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',
      'coverage/**',
      'next-env.d.ts',
      '.turbo/**',
      'public/**',
      '*.config.js',
      '*.config.mjs',
      '*.config.cjs',
      // E2E and load tests - not included in tsconfig for type-aware linting
      'tests/**',
      'src/test/**',
      // Third-party UI components from shadcn/ui
      'src/components/ui/**',
      // Leftover JS fixer scripts from previous sessions
      'fix-*.js',
      'fix-*.sh',
      '*.sh',
      // Corrupted temp files
      'src/components/auth/.*',
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
        ...globals.browser,
        ...globals.node,
        React: 'readonly',
      },
    },
  },

  // JSX Accessibility rules (plugin already included via eslint-config-next)
  {
    files: ['**/*.{jsx,tsx}'],
    rules: {
      // Stricter a11y rules (override next.js defaults)
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-has-content': 'error',
      'jsx-a11y/anchor-is-valid': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-proptypes': 'error',
      'jsx-a11y/aria-unsupported-elements': 'error',
      'jsx-a11y/click-events-have-key-events': 'error',
      'jsx-a11y/heading-has-content': 'error',
      'jsx-a11y/html-has-lang': 'error',
      'jsx-a11y/img-redundant-alt': 'error',
      'jsx-a11y/interactive-supports-focus': 'error',
      'jsx-a11y/label-has-associated-control': 'error',
      'jsx-a11y/no-autofocus': 'warn',
      'jsx-a11y/no-noninteractive-element-interactions': 'warn',
      'jsx-a11y/no-redundant-roles': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error',
      'jsx-a11y/tabindex-no-positive': 'error',
    },
  },

  // Import organization rules
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
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
              pattern: 'react',
              group: 'external',
              position: 'before',
            },
            {
              pattern: 'next/**',
              group: 'external',
              position: 'before',
            },
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
      'import-x/no-cycle': 'warn',
      'import-x/no-self-import': 'error',
    },
  },

  // Security rules
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      security,
    },
    rules: {
      // Disabled: Too many false positives with array indexing and object property access
      'security/detect-object-injection': 'off',
      'security/detect-non-literal-regexp': 'warn',
      'security/detect-unsafe-regex': 'error',
      'security/detect-buffer-noassert': 'error',
      'security/detect-eval-with-expression': 'error',
      'security/detect-no-csrf-before-method-override': 'error',
      'security/detect-possible-timing-attacks': 'warn',
    },
  },

  // Promise handling rules
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
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
    },
  },

  // TypeScript specific rules
  {
    files: ['**/*.{ts,tsx}'],
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
      '@typescript-eslint/explicit-function-return-type': 'off', // Too strict for React components
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: {
            attributes: false, // Allow async onClick handlers
          },
        },
      ],
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'off', // Too strict for React
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

      // Relaxed rules for React patterns
      '@typescript-eslint/unbound-method': 'off', // Conflicts with React event handlers
      '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
    },
  },

  // React specific rules (extending Next.js config)
  {
    files: ['**/*.{jsx,tsx}'],
    rules: {
      // React 19 best practices
      'react/jsx-key': ['error', { checkFragmentShorthand: true }],
      'react/jsx-no-useless-fragment': 'error',
      'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
      'react/self-closing-comp': 'error',
      'react/no-array-index-key': 'warn',
      'react/no-unstable-nested-components': 'error',
      'react/hook-use-state': 'error',

      // Performance rules
      'react/jsx-no-constructed-context-values': 'error',
      'react/no-object-type-as-default-prop': 'error',
    },
  },

  // Server Components / Server Actions rules
  {
    files: ['**/app/**/*.{ts,tsx}', '**/actions/**/*.{ts,tsx}'],
    rules: {
      // Allow async components in app directory
      '@typescript-eslint/require-await': 'off',
      // Disable error-boundaries rule - false positive for Server Components
      // Next.js Server Components use try/catch with JSX for data fetching which is valid
      'react-hooks/error-boundaries': 'off',
    },
  },

  // Business Center components (React Compiler experimental rules produce false positives)
  {
    files: ['**/business-center/**/*.{ts,tsx}', '**/data-table/**/*.{ts,tsx}', '**/changelog/**/*.{ts,tsx}'],
    rules: {
      // Disable React Compiler experimental rules - false positives for valid hook patterns
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/static-components': 'off',
      'react-hooks/purity': 'off',
      // react-virtual library compatibility
      'react-hooks/incompatible-library': 'off',
    },
  },

  // Test files
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', '**/__tests__/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      'security/detect-object-injection': 'off',
    },
  },

  // Config files
  {
    files: ['*.config.{js,mjs,cjs,ts}', 'scripts/**/*.{js,ts}'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'import-x/no-default-export': 'off',
    },
  },

  // Prettier config - MUST be last to disable conflicting rules
  prettierConfig
);

export default eslintConfig;
