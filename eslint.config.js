import { defineConfig, globalIgnores } from 'eslint/config';
import react from 'eslint-config-cheminfo-react/base';
import ts from 'eslint-config-cheminfo-typescript/base';
import unicorn from 'eslint-config-cheminfo-typescript/unicorn';

export default defineConfig(
  globalIgnores([
    'build',
    'coverage',
    'lib',
    'lib-internal',
    'node_modules',
    'playwright-report',
    'test-results',
    'public',
    '.yalc',
  ]),
  ts,
  unicorn,
  react,
  {
    files: ['**/*.{ts,tsx,cts,mts}'],
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-deprecated': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-implied-eval': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-useless-default-assignment': 'off',
      '@typescript-eslint/restrict-plus-operands': 'off',
      '@typescript-eslint/switch-exhaustiveness-check': 'off',
      'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
    },
  },
  {
    rules: {
      'import/default': 'off',
      'import/no-unresolved': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-refresh/only-export-components': 'off',
      'unicorn/consistent-boolean-name': 'off',
      'unicorn/name-replacements': 'off',
      'unicorn/no-computed-property-existence-check': 'off',
      'unicorn/no-immediate-mutation': 'off',
      'unicorn/no-unreadable-object-destructuring': 'off',
      'unicorn/no-useless-else': 'off',
      'unicorn/prefer-await': 'off',
      'unicorn/prefer-combined-guards': 'off',
      'unicorn/prefer-early-return': 'off',
      'unicorn/prefer-continue': 'off',
      // TODO: re-enable this one
      'no-warning-comments': 'off',
      // TODO: same
      '@eslint-react/no-array-index-key': 'off',
      '@eslint-react/naming-convention-ref-name': 'off',
      '@eslint-react/use-state': 'off',
      '@eslint-react/no-clone-element': 'off',
      '@eslint-react/set-state-in-effect': 'off',
      '@eslint-react/no-unstable-default-props': 'off',
      '@eslint-react/purity': 'off',
      '@eslint-react/no-children-map': 'off',
      '@eslint-react/no-children-to-array': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'react-you-might-not-need-an-effect/no-event-handler': 'off',
      'react-you-might-not-need-an-effect/no-external-store-subscription':
        'off',
      'react-you-might-not-need-an-effect/no-adjust-state-on-prop-change':
        'off',
      'react-you-might-not-need-an-effect/no-chain-state-updates': 'off',
      'react-you-might-not-need-an-effect/no-derived-state': 'off',
      'react-you-might-not-need-an-effect/no-pass-data-to-parent': 'off',
      'prefer-named-capture-group': 'off',
      'unicorn/max-nested-calls': 'off',
      'unicorn/no-duplicate-logical-operands': 'off',
      'unicorn/no-negated-array-predicate': 'off',
      'unicorn/prefer-split-limit': 'off',
      'unicorn/prefer-array-from-map': 'off',
      'unicorn/no-subtraction-comparison': 'off',
      'unicorn/no-non-function-verb-prefix': 'off',
      'unicorn/prefer-hoisting-branch-code': 'off',
      '@eslint-react/static-components': 'off',
      'unicorn/no-top-level-side-effects': 'off',
      'unicorn/single-line-block-comment-style': 'off',
      'unicorn/consistent-conditional-object-spread': 'off',
      'unicorn/prefer-object-iterable-methods': 'off',
      'unicorn/no-declarations-before-early-exit': 'off',
      'unicorn/prefer-boolean-return': 'off',
      'unicorn/no-unreadable-for-of-expression': 'off',
      'unicorn/no-unsafe-string-replacement': 'off',
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
        },
        {
          name: 'file-saver',
          message:
            'Use our internal utility at `src/component/utility/save_as.ts`',
        },
      ],
    },
  },
);
