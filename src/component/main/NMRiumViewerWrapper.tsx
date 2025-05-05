import type { RefObject } from 'react';
import type { SplitPaneSize } from 'react-science/ui';
import { SplitPane } from 'react-science/ui';

import { usePreferences } from '../context/PreferencesContext.js';
import { Panels, usePanelOpenState } from '../panels/Panels.js';
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
  const { closeSplitPane, openSplitPane, isSplitPaneOpen } =
    usePanelOpenState();

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

  const displayedPanels = items.filter((item) => {
    const panelOptions = getPanelPreferences(item);
    return panelOptions.display;
  });
  const hasDisplayedPanels = displayedPanels.length > 0;

  if (items?.length === 0 || !hasDisplayedPanels) {
    return <NMRiumViewer emptyText={emptyText} viewerRef={viewerRef} />;
  }

  return (
    <SplitPane
      size={verticalSplitterPosition}
      direction="horizontal"
      controlledSide="end"
      open={isSplitPaneOpen}
      defaultOpen={!general?.hidePanelOnLoad}
      closeThreshold={verticalSplitterCloseThreshold}
      onSizeChange={resizeHandler}
      onOpenChange={(isOpen) => (isOpen ? openSplitPane() : closeSplitPane())}
    >
      <NMRiumViewer emptyText={emptyText} viewerRef={viewerRef} />
      <Panels />
    </SplitPane>
  );
}
