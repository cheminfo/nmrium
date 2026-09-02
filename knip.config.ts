import type { KnipConfig } from 'knip';

export default {
  ignoreBinaries: ['jq'],
  ignoreDependencies: [
    // only for dev debugging
    '@simbathesailor/use-what-changed',
  ],
} satisfies KnipConfig;
