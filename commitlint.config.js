/**
 * Commitlint Configuration
 * Enforces Conventional Commits format
 *
 * Format: <type>(<scope>): <subject>
 *
 * Types:
 * - feat: New feature
 * - fix: Bug fix
 * - docs: Documentation changes
 * - style: Code style changes (formatting, semicolons, etc)
 * - refactor: Code refactoring (no feature/fix)
 * - perf: Performance improvements
 * - test: Adding/updating tests
 * - build: Build system or dependencies changes
 * - ci: CI/CD changes
 * - chore: Other changes (maintenance, tooling)
 * - revert: Revert previous commit
 *
 * Examples:
 * - feat: add user analytics dashboard
 * - fix: resolve login timeout issue
 * - feat(api): add health check endpoint
 * - docs: update versioning guide
 * - chore: upgrade dependencies
 */

export default {
  extends: ['@commitlint/config-conventional'],

  rules: {
    // Type must be one of the allowed types
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation
        'style',    // Formatting, missing semicolons, etc
        'refactor', // Code refactoring
        'perf',     // Performance improvement
        'test',     // Tests
        'build',    // Build system or dependencies
        'ci',       // CI/CD
        'chore',    // Other changes
        'revert'    // Revert
      ]
    ],

    // Subject must not be empty
    'subject-empty': [2, 'never'],

    // Subject must not end with period
    'subject-full-stop': [2, 'never', '.'],

    // Subject must be lowercase
    'subject-case': [2, 'always', 'lower-case'],

    // Body should have blank line before it
    'body-leading-blank': [1, 'always'],

    // Footer should have blank line before it
    'footer-leading-blank': [1, 'always'],

    // Header max length (including type, scope, subject)
    'header-max-length': [2, 'always', 100],

    // Scope is optional but recommended
    'scope-case': [2, 'always', 'lower-case']
  }
};