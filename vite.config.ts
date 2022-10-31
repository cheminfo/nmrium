import react from '@vitejs/plugin-react';
import analyze from 'rollup-plugin-analyzer';
import { AliasOptions, splitVendorChunkPlugin } from 'vite';
import { defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default () => {
  let resolveAliases: AliasOptions = [];
  if (process.env.WITH_PROFILING) {
    resolveAliases = [
      { find: 'react-dom/client', replacement: 'react-dom/profiling' },
      { find: 'scheduler/tracing', replacement: 'scheduler/tracing-profiling' },
    ];
  }

  return defineConfig({
    base: './',
    esbuild: {
      jsx: 'automatic',
      sourcemap: true,
    },
    build: {
      sourcemap: true,
      rollupOptions: {
        plugins: process.env.ANALYZE ? [analyze()] : [],
      },
      minify: process.env.NO_MINIFY ? false : 'esbuild',
    },
    plugins: [react(), splitVendorChunkPlugin()],
    resolve: {
      alias: resolveAliases,
    },
    test: {
      include: ['./src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    },
  });
};
