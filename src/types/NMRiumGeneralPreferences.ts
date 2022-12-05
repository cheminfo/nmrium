import { SplitPaneSize } from 'react-science/ui';

import { PanelPreferencesType } from './PanelPreferencesType';

export interface NMRiumGeneralPreferences {
  hideGeneralSettings: boolean;
  experimentalFeatures: PanelPreferencesType;
  hidePanelOnLoad: boolean;
  initialPanelWidth?: SplitPaneSize;
}
