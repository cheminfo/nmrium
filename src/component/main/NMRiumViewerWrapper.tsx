import type { RefObject } from 'react';
import type { SplitPaneSize } from 'react-science/ui';
import { SplitPane } from 'react-science/ui';

import { usePreferences } from '../context/PreferencesContext.js';
import { Panels } from '../panels/Panels.js';
import { useAccordionItems } from '../panels/hooks/useAccordionItems.js';
import { useGetPanelOptions } from '../panels/hooks/useGetPanelOptions.js';

import type { NMRiumProps } from './NMRium.js';
import { NMRiumViewer } from './NMRiumViewer.js';

interface NMRiumViewerWrapperProps {
  viewerRef: RefObject<HTMLDivElement>;
  emptyText: NMRiumProps['emptyText'];
}

export function NMRiumViewerWrapper(props: NMRiumViewerWrapperProps) {
  const { emptyText, viewerRef } = props;
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
  function handleToggleSplitPanel() {
    dispatch({
      type: 'TOGGLE_SPLIT_PANEL',
      payload: {},
    });
  }

  const displayedPanels = items.filter((item) => {
    const panelOptions = getPanelPreferences(item);
    return panelOptions.display;
  });
  const hasDisplayedPanels = displayedPanels.length > 0;

  if (items?.length === 0 || !hasDisplayedPanels) {
    return <NMRiumViewer emptyText={emptyText} viewerRef={viewerRef} />;
  }

  const isOpen = !general?.hidePanelOnLoad;

  return (
    <SplitPane
      size={verticalSplitterPosition}
      direction="horizontal"
      controlledSide="end"
      open={isOpen}
      defaultOpen={isOpen}
      closeThreshold={verticalSplitterCloseThreshold}
      onSizeChange={resizeHandler}
      onOpenChange={handleToggleSplitPanel}
    >
      <NMRiumViewer emptyText={emptyText} viewerRef={viewerRef} />
      <Panels />
    </SplitPane>
  );
}
