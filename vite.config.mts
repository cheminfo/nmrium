import react from '@vitejs/plugin-react-swc';
import analyze from 'rollup-plugin-analyzer';
import type { AliasOptions } from 'vite'
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
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/openchemlib/')) {
              return 'openchemlib';
            }
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
        },
      },
      minify: process.env.NO_MINIFY ? false : 'esbuild',
    },
    plugins: [react()],
    resolve: {
      alias: resolveAliases,
    },
    test: {
      include: ['./src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    },
  });
};
