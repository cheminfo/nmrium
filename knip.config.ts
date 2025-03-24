import type { KnipConfig } from 'knip';

export default {
  entry: ['src/component/main/index.ts', 'src/index.tsx'],
  ignoreBinaries: ['jq'],
  ignoreDependencies: ['@simbathesailor/use-what-changed'],
} satisfies KnipConfig;
