import type { KnipConfig } from 'knip';

export default {
  ignoreBinaries: ['jq'],
  ignoreDependencies: ['@simbathesailor/use-what-changed', '@vitest/coverage-v8'],
} satisfies KnipConfig;
