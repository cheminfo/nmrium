import styled from '@emotion/styled';
import type { NMRiumPanelPreferences } from '@zakodium/nmrium-core';
import type { PropsWithChildren } from 'react';
import { createContext, memo, useContext, useMemo, useState } from 'react';
import { FaRegEdit } from 'react-icons/fa';
import type { ToolbarItemProps } from 'react-science/ui';
import { Accordion, Toolbar } from 'react-science/ui';

import { usePreferences } from '../context/PreferencesContext.js';
import { useActiveSpectrum } from '../hooks/useActiveSpectrum.js';
import { useDialogToggle } from '../hooks/useDialogToggle.js';

import type { AccordionItem } from './accordionItems.js';
import { useAccordionItems } from './hooks/useAccordionItems.js';
import { useGetPanelOptions } from './hooks/useGetPanelOptions.js';
import { useTogglePanel } from './hooks/useTogglePanel.js';
import { InformationEditionModal } from './informationPanel/InformationEditionModal.js';

const Container = styled.div`
  flex: 1 1 0%;
  height: 100%;
  width: 100%;
`;
interface PanelStateContext {
  openSplitPane: () => void;
  closeSplitPane: () => void;
  isSplitPaneOpen: boolean;
}

const AccordionContext = createContext<PanelStateContext | null>(null);

export function usePanelOpenState() {
  const context = useContext(AccordionContext);

  if (!context) {
    throw new Error('Panel open context must be used within PanelOpenProvider');
  }

  return context;
}

export function PanelOpenProviderProvider({
  children,
}: Required<PropsWithChildren>) {
  const { current } = usePreferences();

  const {
    display: { general = {} },
  } = current;
  // TODO: make sure to move this state to the workspace once the refactoring of nmrium-core is finished.
  const [isSplitPaneOpen, setIsSplitPaneOpen] = useState(
    !general?.hidePanelOnLoad,
  );

  const state = useMemo(() => {
    function openSplitPane() {
      setIsSplitPaneOpen(true);
    }
    function closeSplitPane() {
      setIsSplitPaneOpen(false);
    }
    return {
      openSplitPane,
      closeSplitPane,
      isSplitPaneOpen,
    };
  }, [isSplitPaneOpen]);

  return (
    <AccordionContext.Provider value={state}>
      {children}
    </AccordionContext.Provider>
  );
}

function PanelsInner() {
  const getPanelPreferences = useGetPanelOptions();
  const { dialog, openDialog, closeDialog } = useDialogToggle({
    informationModal: false,
  });
  const { dispatch } = usePreferences();
  const items = useAccordionItems();
  function isOpened(item: AccordionItem) {
    const panelOptions = getPanelPreferences(item);
    return panelOptions?.open;
  }
  function isVisible(item: AccordionItem) {
    const panelOptions = getPanelPreferences(item);
    return panelOptions?.display;
  }

  const displayedPanels = items.filter((item) => {
    return isVisible(item);
  });

  return (
    <Container>
      <InformationEditionModal
        isOpen={dialog.informationModal}
        onCloseDialog={closeDialog}
      />
      <Accordion>
        {displayedPanels.map((item) => {
          const { title, component, id } = item;
          return (
            <Accordion.Item
              unmountChildren
              id={id}
              key={title}
              title={title}
              open={isOpened(item)}
              onOpenChange={(isOpened) => {
                dispatch({
                  type: 'TOGGLE_PANEL',
                  payload: { id, options: { open: isOpened } },
                });
              }}
              renderToolbar={() => (
                <RightButtons
                  id={id}
                  onEdit={(event) => {
                    event.stopPropagation();
                    openDialog('informationModal');
                  }}
                />
              )}
            >
              {component}
            </Accordion.Item>
          );
        })}
      </Accordion>
    </Container>
  );
}

function RightButtons(props: {
  id: keyof NMRiumPanelPreferences;
  onEdit: ToolbarItemProps['onClick'];
}) {
  const { onEdit, id } = props;
  const activeSpectrum = useActiveSpectrum();
  const toggle = useTogglePanel();
  function handleClosePanel(event: any) {
    event?.stopPropagation();
    toggle(id);
  }

  return (
    <Toolbar>
      {id === 'informationPanel' && (
        <Toolbar.Item
          disabled={!activeSpectrum}
          tooltipProps={{ intent: !activeSpectrum ? 'danger' : 'none' }}
          icon={<FaRegEdit />}
          onClick={onEdit}
          tooltip={
            !activeSpectrum
              ? 'Select a spectrum to edit its meta information'
              : 'Edit spectrum meta information'
          }
        />
      )}
      <Toolbar.Item
        icon="cross"
        tooltip="Close panel"
        onClick={handleClosePanel}
      />
    </Toolbar>
  );
}

const MemoizedPanels = memo(PanelsInner);

export function Panels() {
  return <MemoizedPanels />;
}
