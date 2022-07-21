import { InitialSeparation } from 'analysis-ui-components/lib-esm/components/SplitPane';

import { PanelPreferencesType } from './PanelPreferencesType';

export interface NMRiumGeneralPreferences {
  disableMultipletAnalysis: boolean;
  hideSetSumFromMolecule: boolean;
  hideGeneralSettings: boolean;
  experimentalFeatures: PanelPreferencesType;
  hidePanelOnLoad: boolean;
  initialPanelWidth?: InitialSeparation;
}
