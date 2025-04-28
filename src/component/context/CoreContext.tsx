import type { NMRiumCore } from '@zakodium/nmrium-core';
import { createContext, useContext } from 'react';

const CoreContext = createContext<NMRiumCore | null>(null);
export const CoreProvider = CoreContext.Provider;
export function useCore() {
  const core = useContext(CoreContext);

  if (!core) {
    throw new Error('useCore must be used within a CoreProvider');
  }

  return core;
}
