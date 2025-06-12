import type { KnipConfig } from 'knip';

export default {
  entry: ['src/index.tsx'],
  ignoreBinaries: ['jq'],
  ignoreDependencies: ['@simbathesailor/use-what-changed'],
} satisfies KnipConfig;
