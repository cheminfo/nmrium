import react from 'eslint-config-cheminfo-react/base';
import ts from 'eslint-config-cheminfo-typescript/base';
import unicorn from 'eslint-config-cheminfo-typescript/unicorn';

export default [

  {
    ignores: [
      'build',
      'coverage',
      'lib',
      'lib-cjs',
      'node_modules',
      'playwright-report',
      'test-results',
      'public',
    ],
  },
  ...ts,
  ...unicorn,
  ...react,
  {
    files: ["**/pdnd.cts"],
    rules: {
      "import/no-extraneous-dependencies": "off",
    },
  },
  {
    files: ['**/*.{ts,tsx,cts,mts}'],
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
    },
  },
  {
    rules: {
      '@typescript-eslint/switch-exhaustiveness-check': 'off',
      'import/default': 'off',
      'import/no-unresolved': 'off',
      'react-refresh/only-export-components': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-implied-eval': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/restrict-plus-operands': 'off',
      'react/no-unstable-nested-components': 'off',
      'no-restricted-imports': [
        'error',
        {
          name: 'lodash',
          message:
            "Use a deep import instead, like for example 'lodash/merge.js'",
        },
        {
          name: '@simbathesailor/use-what-changed',
          message: 'Remove use-what-changed before committing the code',
        }],
      'react/no-unknown-property': ['error', { ignore: ['css'] }],
      'react/forbid-dom-props': [
        'error',
        {
          forbid: [
            {
              propName: 'data-test-id',
              message: 'Use data-testid instead (testing framework standard)',
            },
          ],
        },
      ],
    },
  },
];
