import type { ReactNode } from 'react';
import { createContext, useContext, useMemo } from 'react';

import type { NMRiumPlugin, NMRiumPluginSlots } from './types.js';

const PluginsContext = createContext<NMRiumPlugin[]>([]);

interface PluginsProviderProps {
  plugins?: NMRiumPlugin[];
  children: ReactNode;
}

export function PluginsProvider({ plugins, children }: PluginsProviderProps) {
  const value = useMemo(() => plugins ?? [], [plugins]);
  return (
    <PluginsContext.Provider value={value}>{children}</PluginsContext.Provider>
  );
}

/** Returns the last registered component for the given slot, or undefined. */
export function usePluginSlot<K extends keyof NMRiumPluginSlots>(
  slot: K,
): NMRiumPluginSlots[K] | undefined {
  const plugins = useContext(PluginsContext);
  for (let i = plugins.length - 1; i >= 0; i--) {
    const component = plugins[i].slots?.[slot];
    if (component) return component;
  }
  return undefined;
}
