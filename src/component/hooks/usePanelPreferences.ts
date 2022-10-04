import lodashMerge from 'lodash/merge';
import { useMemo } from 'react';

import { usePreferences } from '../context/PreferencesContext';
import {
  getIntegralDefaultValues,
  getPeaksDefaultValues,
  getZoneDefaultValues,
  getRangeDefaultValues,
  databaseDefaultValues,
} from '../reducer/preferences/panelsPreferencesDefaultValues';
import { getValue } from '../utility/LocalStorage';
import {
  PanelsPreferences,
  Workspace,
  WorkSpacePanelPreferences,
} from '../workspaces/Workspace';

const basePath = 'formatting.panels';

type Panel = 'peaks' | 'integrals' | 'zones' | 'ranges' | 'database';

function getDefaultPreferences(panelKey: Panel, nucleus?: string) {
  switch (panelKey) {
    case 'peaks':
      return getPeaksDefaultValues(nucleus);
    case 'integrals':
      return getIntegralDefaultValues(nucleus);
    case 'ranges':
      return getRangeDefaultValues(nucleus);
    case 'zones':
      return getZoneDefaultValues(nucleus);
    case 'database':
      return databaseDefaultValues;

    default:
      return {};
  }
}

function joinWithNucleusPreferences<T extends Exclude<Panel, 'database'>>(
  data: PanelsPreferences[T],
  nucleus: string,
  returnOnlyNucleusPreferences = false,
) {
  const { nuclei = {}, ...rest } = data;

  if (returnOnlyNucleusPreferences) {
    return nuclei?.[nucleus];
  }

  return { ...nuclei[nucleus], ...rest };
}

function getPanelPreferences(
  preferences: Workspace,
  panelKey: Panel,
  nucleus?: string,
  returnOnlyNucleusPreferences = false,
) {
  const panelPreferences = lodashMerge(
    {},
    getDefaultPreferences(panelKey, nucleus),
    getValue(preferences, `${basePath}.${panelKey}`, {}),
  );

  if (panelKey !== 'database' && nucleus) {
    return joinWithNucleusPreferences(
      panelPreferences,
      nucleus,
      returnOnlyNucleusPreferences,
    );
  }

  return panelPreferences;
}

export function usePanelPreferences<T extends Panel>(
  panelKey: T,
  nucleus: string,
): WorkSpacePanelPreferences[T];
export function usePanelPreferences<T extends 'database'>(
  panelKey: T,
): WorkSpacePanelPreferences['database'];

export function usePanelPreferences<T extends Panel>(
  panelKey: T,
  nucleus?: string,
): WorkSpacePanelPreferences[T] {
  const { current } = usePreferences();

  return useMemo(() => {
    return getPanelPreferences(current, panelKey, nucleus);
  }, [current, nucleus, panelKey]);
}

export type UsePanelPreferencesByNucleiResult<T extends Panel> =
  T extends 'peaks'
    ? PanelsPreferences['peaks']
    : T extends 'integrals'
    ? PanelsPreferences['integrals']
    : T extends 'zones'
    ? PanelsPreferences['zones']
    : T extends 'ranges'
    ? PanelsPreferences['ranges']
    : void;

export function usePanelPreferencesByNuclei<T extends Panel>(
  panelKey: T,
  nuclei: string[],
): UsePanelPreferencesByNucleiResult<T> {
  const { current } = usePreferences();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { nuclei: omitNuclei = null, ...restPreferences } = getPanelPreferences(
    current,
    panelKey,
  );

  return useMemo(() => {
    const _nuclei: Array<any> = [];
    nuclei.forEach((nucleusLabel) => {
      _nuclei[nucleusLabel] = getPanelPreferences(
        current,
        panelKey,
        nucleusLabel,
        true,
      );
    });
    return {
      nuclei: _nuclei,
      ...restPreferences,
    };
  }, [current, nuclei, panelKey, restPreferences]);
}
