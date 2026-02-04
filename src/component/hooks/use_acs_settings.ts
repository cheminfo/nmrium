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

export function useACSSettings() {
  const nucleus = useActiveNucleusTab();
  const { current } = usePreferences();
  return current.acsExportSettings[nucleus] || defaultOptions;
}
