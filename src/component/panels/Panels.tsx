import styled from '@emotion/styled';
import type { NMRiumPanelPreferences } from '@zakodium/nmrium-core';
import { memo } from 'react';
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
