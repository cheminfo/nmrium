import { SplitPane } from 'analysis-ui-components';

import { usePreferences } from './context/PreferencesContext';

export function SplitPaneWrapper({ children }) {
  const { current } = usePreferences();
  return (
    <SplitPane
      key={current?.display?.general?.hidePanelOnLoad ? 'true' : 'false'}
      initialSeparation="590px"
      orientation="horizontal"
      sideSeparation="end"
      initialClosed={current?.display?.general?.hidePanelOnLoad || false}
    >
      {children}
    </SplitPane>
  );
}
