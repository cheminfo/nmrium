import reactRefresh from '@vitejs/plugin-react-refresh';
import analyze from 'rollup-plugin-analyzer';
import { AliasOptions, defineConfig } from 'vite';

// https://vitejs.dev/config/
export default () => {
  let resolveAliases: AliasOptions = [];
  if (process.env.WITH_PROFILING) {
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
      sourcemap: true,
    },
    build: {
      rollupOptions: {
        plugins: process.env.ANALYZE ? [analyze()] : [],
      },
      minify: process.env.NO_MINIFY ? false : 'esbuild',
    },
    plugins: [reactRefresh()],
    resolve: {
      alias: resolveAliases,
    },
  });
};
