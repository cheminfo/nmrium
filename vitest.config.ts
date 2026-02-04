import fs from 'node:fs';
import path from 'node:path';

import { defaultClientConditions } from 'vite';
import { defineConfig } from 'vitest/config';

export default () => {
  const isMonorepo = checkMonorepo();

  return defineConfig({
    base: './',
    ssr: {
      resolve: {
        conditions: isMonorepo
          ? ['nmrium-internal', ...defaultClientConditions]
          : undefined,
      },
    },
    test: {
      include: [
        './src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        './src/**/*.test-d.ts',
      ],
    },
  });
};

function checkMonorepo() {
  const monorepoPkg = path.join(import.meta.dirname, '..', 'package.json');
  if (!fs.existsSync(monorepoPkg)) return false;
  const pkg = JSON.parse(fs.readFileSync(monorepoPkg, 'utf8'));
  return pkg.name === '@zakodium/nmrium-monorepo';
}
