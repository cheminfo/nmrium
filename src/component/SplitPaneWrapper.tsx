import { SplitPane } from 'analysis-ui-components';

import { usePreferences } from './context/PreferencesContext';

export function SplitPaneWrapper({ children }) {
  const { current } = usePreferences();
  const { hidePanelOnLoad = false, initialPanelWidth = '560px' } =
    current?.display?.general || {};
  return (
    <SplitPane
      key={hidePanelOnLoad ? 'true' : 'false'}
      initialSize={initialPanelWidth}
      direction="horizontal"
      controlledSide="end"
      initialClosed={hidePanelOnLoad ? true : 600}
    >
      {children}
    </SplitPane>
  );
}
