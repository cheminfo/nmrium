import reactRefresh from '@vitejs/plugin-react-refresh';
import analyze from 'rollup-plugin-analyzer';
import { AliasOptions, defineConfig } from 'vite';

// https://vitejs.dev/config/
export default ({ mode }) => {
  let resolveAliases: AliasOptions = [];
  if (mode === 'profiling') {
    resolveAliases = [
      { find: /react-dom$/, replacement: 'react-dom/profiling' },
      { find: 'scheduler/tracing', replacement: 'scheduler/tracing-profiling' },
    ];
  }

  return defineConfig({
    base: './',
    esbuild: {
      // Import jsx for Emotion and React for Fragment.
      jsxFactory: 'jsx',
      jsxInject: `
      import { jsx } from '@emotion/react';
      import React from 'react';
    `,
    },
    build: {
      rollupOptions: {
        plugins: process.env.ANALYZE ? [analyze()] : [],
      },
    },
    plugins: [reactRefresh()],
    resolve: {
      alias: resolveAliases,
    },
  });
};
