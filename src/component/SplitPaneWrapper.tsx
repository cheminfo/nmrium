import { SplitPane } from 'analysis-ui-components';

import { usePreferences } from './context/PreferencesContext';

export function SplitPaneWrapper({ children }) {
  const { current } = usePreferences();
  const { hidePanelOnLoad = false, initialPanelWidth = '560px' } =
    current?.display?.general || {};
  return (
    <SplitPane
      key={hidePanelOnLoad ? 'true' : 'false'}
      initialSeparation={initialPanelWidth}
      orientation="horizontal"
      sideSeparation="end"
      {...(hidePanelOnLoad ? { initialClosed: true } : { minimumSize: 600 })}
    >
      {children}
    </SplitPane>
  );
}
