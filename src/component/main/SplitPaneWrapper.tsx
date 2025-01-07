import { useEffect, useState } from 'react';
import type { SplitPaneSize } from 'react-science/ui';
import { SplitPane } from 'react-science/ui';

import { usePreferences } from '../context/PreferencesContext.js';
import { useAccordionItems } from '../panels/hooks/useAccordionItems.js';
import { useGetPanelOptions } from '../panels/hooks/useGetPanelOptions.js';

export function SplitPaneWrapper({ children }) {
  const { current, dispatch } = usePreferences();
  const getPanelPreferences = useGetPanelOptions();

  const {
    general: { verticalSplitterPosition, verticalSplitterCloseThreshold },
    display: { general = {} },
  } = current;
  const items = useAccordionItems();

  function resizeHandler(value: SplitPaneSize) {
    dispatch({
      type: 'SET_VERTICAL_SPLITTER_POSITION',
      payload: {
        value,
      },
    });
  }
  const [closed, setClosedValue] = useState(
    general?.hidePanelOnLoad ? true : verticalSplitterCloseThreshold,
  );
  const displayedPanels = items.filter((item) => {
    const panelOptions = getPanelPreferences(item);
    return panelOptions.display;
  });

  const hasDisplayedPanels = displayedPanels.length > 0;

  useEffect(() => {
    if (!hasDisplayedPanels) {
      setClosedValue(true);
    } else {
      setClosedValue(false);
    }
  }, [hasDisplayedPanels]);

  if (items?.length === 0 || !hasDisplayedPanels) {
    return <div style={{ width: '100%', height: '100%' }}>{children}</div>;
  }

  return (
    <SplitPane
      size={verticalSplitterPosition}
      direction="horizontal"
      controlledSide="end"
      closed={closed}
      onResize={resizeHandler}
    >
      {children}
    </SplitPane>
  );
}
