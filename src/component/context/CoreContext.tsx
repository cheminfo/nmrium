import type { NMRiumCore } from '@zakodium/nmrium-core';
import { createContext, use } from 'react';

export const CoreContext = createContext<NMRiumCore | null>(null);

export function useCore() {
  const core = use(CoreContext);

  if (!core) {
    throw new Error('useCore must be used within a CoreProvider');
  }

  return core;
}
