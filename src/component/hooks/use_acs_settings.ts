import type { ACSExportOptions } from '@zakodium/nmrium-core';

import { usePreferences } from '../context/PreferencesContext.tsx';

import { useActiveNucleusTab } from './useActiveNucleusTab.ts';

const defaultOptions: ACSExportOptions = {
  signalKind: 'signal',
  ascending: true,
  format: 'IMJA',
  couplingFormat: '0.00',
  deltaFormat: '0.00',
  textStyle: {},
};

export function useActiveACSSettings() {
  const nucleus = useActiveNucleusTab();

  return useACSSettings(nucleus);
}

export function useACSSettings(nucleus: string | undefined) {
  const { current } = usePreferences();
  if (!nucleus) return defaultOptions;

  return current.acsExportSettings[nucleus] || defaultOptions;
}
