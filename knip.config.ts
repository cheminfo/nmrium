import type { KnipConfig } from 'knip';

export default {
  entry: ['src/component/main/index.ts', 'src/index.tsx'],
  ignoreBinaries: ['jq'],
} satisfies KnipConfig;
