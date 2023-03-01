import { SplitPane, SplitPaneSize } from 'react-science/ui';

import { usePreferences } from './context/PreferencesContext';

export function SplitPaneWrapper({ children }) {
  const { current, dispatch } = usePreferences();
  const {
    general: { verticalSplitterPosition, verticalSplitterCloseThreshold },
    display: { general = {} },
  } = current;

  function resizeHandler(position: SplitPaneSize) {
    dispatch({
      type: 'SET_VERTICAL_SPLITTER_POSITION',
      payload: { value: position },
    });
  }

  return (
    <SplitPane
      initialSize={verticalSplitterPosition}
      direction="horizontal"
      controlledSide="end"
      initialClosed={
        general?.hidePanelOnLoad ? true : verticalSplitterCloseThreshold
      }
      onResize={resizeHandler}
    >
      {children}
    </SplitPane>
  );
}
