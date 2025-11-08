import turboConfig from 'eslint-config-turbo/flat';

const eslintConfig = [
  ...turboConfig,
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',
      'next-env.d.ts',
      '.turbo/**',
      'public/**',
    ],
  },
  {
    rules: {
      // Custom rules can be added here
    },
  },
];

export default eslintConfig;
