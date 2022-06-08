import { SplitPane } from 'analysis-ui-components';

import { usePreferences } from './context/PreferencesContext';

export function SplitPaneWrapper({ children }) {
  const { current } = usePreferences();
  const general = current?.display?.general || {};
  return (
    <SplitPane
      initialSeparation={general?.initialPanelWidth || '560px'}
      orientation="horizontal"
      sideSeparation="end"
      initialClosed={general?.hidePanelOnLoad || false}
      minimumSize={600}
    >
      {children}
    </SplitPane>
  );
}
