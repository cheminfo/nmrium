import { useMemo } from 'react';

import { usePreferences } from '../context/PreferencesContext';
import {
  integralDefaultValues,
  peaksDefaultValues,
  zoneDefaultValues,
  getRangeDefaultValues,
  databaseDefaultValues,
} from '../reducer/preferences/panelsPreferencesDefaultValues';
import { getValue } from '../utility/LocalStorage';
import {
  DatabasePanelPreferences,
  IntegralsPanelPreferences,
  PeaksPanelPreferences,
  RangesPanelPreferences,
  Workspace,
  ZonesPanelPreferences,
} from '../workspaces/Workspace';

type Panel = 'peaks' | 'integrals' | 'zones' | 'ranges' | 'database';

function getDefaultPreferences(panelKey: Panel, nucleus: string) {
  switch (panelKey) {
    case 'peaks':
      return peaksDefaultValues;
    case 'integrals':
      return integralDefaultValues;
    case 'ranges':
      return getRangeDefaultValues(nucleus);
    case 'zones':
      return zoneDefaultValues;
    case 'database':
      return databaseDefaultValues;

    default:
      return {};
  }
}

function getKeyPath(panelKey: Panel, nucleus: string) {
  if (panelKey === 'database') {
    return `formatting.panels.${panelKey}`;
  }

  return `formatting.panels.${panelKey}.[${nucleus}]`;
}

interface PreferencesReturnType {
  peaks: PeaksPanelPreferences;
  integrals: IntegralsPanelPreferences;
  zones: ZonesPanelPreferences;
  ranges: RangesPanelPreferences;
  database: DatabasePanelPreferences;
}

export function usePanelPreferences<T extends Panel>(
  panelKey: T,
  nucleus: string,
): PreferencesReturnType[T] {
  const { current } = usePreferences();

  return useMemo(
    () =>
      getValue(
        current,
        getKeyPath(panelKey, nucleus),
        getDefaultPreferences(panelKey, nucleus),
      ),
    [current, nucleus, panelKey],
  );
}
export function getPanelPreferences(
  preferences: Workspace,
  panelKey: Panel,
  nucleus: string,
) {
  return getValue(
    preferences,
    getKeyPath(panelKey, nucleus),
    getDefaultPreferences(panelKey, nucleus),
  );
}

export function usePanelPreferencesByNuclei<T extends Panel>(
  panelKey: T,
  nuclei: string[],
): Record<string, PreferencesReturnType[T]> {
  const { current } = usePreferences();

  return useMemo(
    () =>
      nuclei.reduce((acc, nucleusLabel) => {
        acc[nucleusLabel] = getPanelPreferences(
          current,
          panelKey,
          nucleusLabel,
        );
        return acc;
      }, {}),

    [current, nuclei, panelKey],
  );
}
