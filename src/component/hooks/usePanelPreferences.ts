import has from 'lodash/has';
import { useMemo } from 'react';

import { MatrixOptions } from '../../data/types/data1d/MatrixOptions';
import { usePreferences } from '../context/PreferencesContext';
import {
  getIntegralDefaultValues,
  getPeaksDefaultValues,
  getZoneDefaultValues,
  getRangeDefaultValues,
  databaseDefaultValues,
  getMultipleSpectraAnalysisDefaultValues,
  getSpectraDefaultValues,
} from '../reducer/preferences/panelsPreferencesDefaultValues';
import { getValue } from '../utility/LocalStorage';
import {
  PanelsPreferences,
  Workspace,
  WorkSpacePanelPreferences,
} from '../workspaces/Workspace';

const basePath = 'formatting.panels';

type Panel =
  | 'spectra'
  | 'peaks'
  | 'integrals'
  | 'zones'
  | 'ranges'
  | 'database'
  | 'multipleSpectraAnalysis'
  | 'matrixGeneration';

function getDefaultPreferences(panelKey: Panel, nucleus?: string) {
  switch (panelKey) {
    case 'spectra':
      return getSpectraDefaultValues(nucleus);
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
    case 'multipleSpectraAnalysis':
      return getMultipleSpectraAnalysisDefaultValues(nucleus);

    default:
      return {};
  }
}

function joinWithNucleusPreferences<
  T extends Exclude<Panel, 'database' | 'matrixGeneration'>,
>(
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
  const panelPath = `${basePath}.${panelKey}`;
  let path = panelPath;

  if (nucleus) {
    switch (panelKey) {
      case 'matrixGeneration':
        path = `${panelPath}.${nucleus}`;
        break;
      default:
        path = `${panelPath}.nuclei.${nucleus}`;
        break;
    }
  }

  let panelPreferences: any = {};
  if (has(preferences, path)) {
    panelPreferences = getValue(preferences, panelPath, {});
  } else {
    panelPreferences = getDefaultPreferences(panelKey, nucleus);
  }

  switch (panelKey) {
    case 'matrixGeneration':
      return nucleus ? panelPreferences[nucleus] : {};
    case 'database':
      return panelPreferences;
    default:
      return nucleus
        ? joinWithNucleusPreferences(
            panelPreferences,
            nucleus,
            returnOnlyNucleusPreferences,
          )
        : {};
  }
}

export function usePanelPreferences<T extends Panel>(
  panelKey: T,
  nucleus: string,
): T extends 'matrixGeneration' ? MatrixOptions : WorkSpacePanelPreferences[T];
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
  T extends 'spectra'
    ? PanelsPreferences['spectra']
    : T extends 'peaks'
    ? PanelsPreferences['peaks']
    : T extends 'integrals'
    ? PanelsPreferences['integrals']
    : T extends 'zones'
    ? PanelsPreferences['zones']
    : T extends 'ranges'
    ? PanelsPreferences['ranges']
    : T extends 'multipleSpectraAnalysis'
    ? PanelsPreferences['multipleSpectraAnalysis']
    : T extends 'matrixGeneration'
    ? PanelsPreferences['matrixGeneration']
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
    return {
      nuclei: Object.fromEntries(
        nuclei.map((nucleusLabel) => [
          nucleusLabel,
          getPanelPreferences(current, panelKey, nucleusLabel, true),
        ]),
      ),
      ...restPreferences,
    };
  }, [current, nuclei, panelKey, restPreferences]);
}
