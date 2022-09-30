import { SplitPaneSize } from 'analysis-ui-components';

import { PanelPreferencesType } from './PanelPreferencesType';

export interface NMRiumGeneralPreferences {
  hideGeneralSettings: boolean;
  experimentalFeatures: PanelPreferencesType;
  hidePanelOnLoad: boolean;
  initialPanelWidth?: SplitPaneSize;
}
