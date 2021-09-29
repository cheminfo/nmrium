import react from '@vitejs/plugin-react';
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
      sourcemap: true,
    },
    build: {
      sourcemap: true,
      rollupOptions: {
        plugins: process.env.ANALYZE ? [analyze()] : [],
      },
      minify: process.env.NO_MINIFY ? false : 'esbuild',
    },
    plugins: [react()],
    resolve: {
      alias: resolveAliases,
    },
  });
};
