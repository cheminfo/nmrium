import type { NMRiumPanelPreferences } from '@zakodium/nmrium-core';
import { createContext, memo, useContext, useMemo, useState } from 'react';
import { FaRegEdit } from 'react-icons/fa';
import type { ToolbarItemProps } from 'react-science/ui';
import { Accordion, Toolbar } from 'react-science/ui';

import { useActiveSpectrum } from '../hooks/useActiveSpectrum.js';
import { useDialogToggle } from '../hooks/useDialogToggle.js';

import type { AccordionItem } from './accordionItems.js';
import { useAccordionItems } from './hooks/useAccordionItems.js';
import { useGetPanelOptions } from './hooks/useGetPanelOptions.js';
import { useTogglePanel } from './hooks/useTogglePanel.js';
import { InformationEditionModal } from './informationPanel/InformationEditionModal.js';

type PanelOpenState = Partial<Record<keyof NMRiumPanelPreferences, boolean>>;
interface PanelStateContext {
  setPanelOpenState: (id: keyof NMRiumPanelPreferences, value: boolean) => void;
  panelOpenState: PanelOpenState;
}

const AccordionContext = createContext<PanelStateContext | null>(null);

export function usePanelOpenState() {
  const context = useContext(AccordionContext);

  if (!context) {
    throw new Error('Panel open context must be used within PanelOpenProvider');
  }

  return context;
}

export function PanelOpenProviderProvider({ children }) {
  const [panelOpenState, toggleAccordionItem] = useState<PanelOpenState>({});

  const state = useMemo(() => {
    function setPanelOpenState(
      id: keyof NMRiumPanelPreferences,
      value: boolean,
    ) {
      toggleAccordionItem((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
    return { setPanelOpenState, panelOpenState };
  }, [panelOpenState]);

  return (
    <AccordionContext.Provider value={state}>
      {children}
    </AccordionContext.Provider>
  );
}

function PanelsInner() {
  const getPanelPreferences = useGetPanelOptions();
  const { panelOpenState } = usePanelOpenState();
  const { dialog, openDialog, closeDialog } = useDialogToggle({
    informationModal: false,
  });

  const items = useAccordionItems();
  function isOpened(item: AccordionItem) {
    const panelOptions = getPanelPreferences(item);
    return panelOptions?.open;
  }
  function isVisible(item: AccordionItem) {
    const panelOptions = getPanelPreferences(item);
    return panelOptions?.display;
  }

  return (
    <div style={{ width: '100%', height: '100%', flex: '1 1 0%' }}>
      <InformationEditionModal
        isOpen={dialog.informationModal}
        onCloseDialog={closeDialog}
      />
      <Accordion>
        {items
          .filter((item) => isVisible(item))
          .map((item) => {
            const { title, component, id } = item;
            return (
              <Accordion.Item
                unmountChildren
                id={id}
                key={title}
                title={title}
                defaultOpen={isOpened(item) || panelOpenState[id]}
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
    </div>
  );
}

function RightButtons(props: {
  id: keyof NMRiumPanelPreferences;
  onEdit: ToolbarItemProps['onClick'];
}) {
  const { onEdit, id } = props;
  const activeSpectrum = useActiveSpectrum();
  const toggle = useTogglePanel();
  function handleClosePanel(event) {
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
