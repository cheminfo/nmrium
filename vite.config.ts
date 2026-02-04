import fs from 'node:fs';
import path from 'node:path';

import react from '@vitejs/plugin-react';
import analyze from 'rollup-plugin-analyzer';
import type { AliasOptions } from 'vite';
import { defaultClientConditions } from 'vite';
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

  const isMonorepo = checkMonorepo();

  return defineConfig({
    base: './',
    esbuild: {
      jsx: 'automatic',
      sourcemap: 'inline',
    },
    build: {
      sourcemap: 'inline',
      rollupOptions: {
        // @ts-expect-error analyzer types are wrong.
        plugins: process.env.ANALYZE ? [analyze()] : [],
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/openchemlib/')) {
              return 'openchemlib';
            }

            if (id.includes('node_modules')) {
              return 'vendor';
            }

            return undefined;
          },
        },
      },
      minify: process.env.NO_MINIFY ? false : 'esbuild',
    },
    plugins: [react()],
    resolve: {
      conditions: isMonorepo
        ? ['nmrium-internal', ...defaultClientConditions]
        : undefined,
      alias: resolveAliases,
    },
    ssr: {
      resolve: {
        conditions: isMonorepo
          ? ['nmrium-internal', ...defaultClientConditions]
          : undefined,
      },
    },
    test: {
      include: ['./src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    },
  });
};

function checkMonorepo() {
  const monorepoPkg = path.join(import.meta.dirname, '..', 'package.json');
  if (!fs.existsSync(monorepoPkg)) return false;
  const pkg = JSON.parse(fs.readFileSync(monorepoPkg, 'utf8'));
  return pkg.name === '@zakodium/nmrium-monorepo';
}
