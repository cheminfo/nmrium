import { createContext, useContext, useMemo, useState } from 'react';
import type { SplitPaneProps, SplitPaneSize } from 'react-science/ui';
import { SplitPane } from 'react-science/ui';

import { usePreferences } from '../context/PreferencesContext.js';

interface SplitContextState extends Pick<SplitPaneProps, 'closed'> {
  toggleSplit: (value: boolean) => void;
}

const SplitContext = createContext<SplitContextState | null>(null);

export function useSplit() {
  const context = useContext(SplitContext);

  if (!context) {
    throw new Error('split context must be used within SplitProvider');
  }

  return context;
}

export function SplitProvider({ children }) {
  const { current } = usePreferences();

  const {
    general: { verticalSplitterCloseThreshold },
    display: { general = {} },
  } = current;

  const [closed, setClosedValue] = useState(
    general?.hidePanelOnLoad ? true : verticalSplitterCloseThreshold,
  );

  const state = useMemo(() => {
    function toggleSplit(value: boolean) {
      setClosedValue(value);
    }

    return { closed, toggleSplit };
  }, [closed]);
  return (
    <SplitContext.Provider value={state}>{children}</SplitContext.Provider>
  );
}

export function SplitPaneWrapper({ children }) {
  const { current, dispatch } = usePreferences();
  const {
    general: { verticalSplitterPosition },
  } = current;

  const { closed } = useSplit();

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
      closed={closed}
      onResize={resizeHandler}
    >
      {children}
    </SplitPane>
  );
}
