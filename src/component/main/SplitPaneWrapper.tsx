import type { SplitPaneSize } from 'react-science/ui';
import { SplitPane } from 'react-science/ui';

import { usePreferences } from '../context/PreferencesContext.js';

export function SplitPaneWrapper({ children }) {
  const { current, dispatch } = usePreferences();
  const {
    general: { verticalSplitterPosition, verticalSplitterCloseThreshold },
    display: { general = {} },
  } = current;

  function resizeHandler(value: SplitPaneSize) {
    dispatch({
      type: 'SET_VERTICAL_SPLITTER_POSITION',
      payload: {
        value,
      },
    });
  }

  return (
    <SplitPane
      size={verticalSplitterPosition}
      direction="horizontal"
      controlledSide="end"
      closed={general?.hidePanelOnLoad ? true : verticalSplitterCloseThreshold}
      onResize={resizeHandler}
    >
      {children}
    </SplitPane>
  );
}
