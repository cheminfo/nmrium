import type { KnipConfig } from 'knip';

export default {
  ignoreBinaries: ['jq'],
  ignoreDependencies: [
    // only for dev debugging
    '@simbathesailor/use-what-changed',
    // version fixed to 4.5.0
    // https://github.com/react-grid-layout/react-draggable/issues/806
    'react-draggable',
  ],
} satisfies KnipConfig;
