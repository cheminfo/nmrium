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
      payload: {
        value: `${Number(position.replace(/\D+$/g, '')).toFixed(
          0,
        )}px` as SplitPaneSize,
      },
    });
  }

  return (
    <SplitPane
      key={`${
        general?.hidePanelOnLoad ? 'true' : 'false'
      }${verticalSplitterPosition}`}
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
