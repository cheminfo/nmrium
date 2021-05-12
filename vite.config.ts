import reactRefresh from '@vitejs/plugin-react-refresh';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default ({ mode }) => {
  let resolveAliases = {};
  if (mode === 'profiling') {
    resolveAliases = [
      { find: /react-dom$/, replacement: 'react-dom/profiling' },
      { find: 'scheduler/tracing', replacement: 'scheduler/tracing-profiling' },
    ];
  }

  return defineConfig({
    esbuild: {
      // Import jsx for Emotion and React for Fragment.
      jsxFactory: 'jsx',
      jsxInject: `
      import { jsx } from '@emotion/react';
      import React from 'react';
    `,
    },
    plugins: [reactRefresh()],
    resolve: {
      alias: resolveAliases,
    },
  });
};
