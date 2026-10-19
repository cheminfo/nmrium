import styled from '@emotion/styled';
import type { NMRiumPanelPreferences } from '@zakodium/nmrium-core';
import type { MouseEvent } from 'react';
import { memo } from 'react';
import { Accordion, Toolbar } from 'react-science/ui';

import { usePreferences } from '../context/PreferencesContext.js';
import useCheckExperimentalFeature from '../hooks/useCheckExperimentalFeature.js';

import { AssignmentListPanel } from './AssignmentListPanel/AssignmentListPanel.js';
import type { AccordionItem } from './accordionItems.js';
import { useAccordionItems } from './hooks/useAccordionItems.js';
import { useGetPanelOptions } from './hooks/useGetPanelOptions.js';
import { useTogglePanel } from './hooks/useTogglePanel.js';

const Container = styled.div`
  flex: 1 1 0%;
  height: 100%;
  width: 100%;
`;

function PanelsInner() {
  const isExperimental = useCheckExperimentalFeature();
  const getPanelPreferences = useGetPanelOptions();

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
      <Accordion>
        {[
          ...displayedPanels.map((item) => {
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
                renderToolbar={() => <RightButtons id={id} />}
              >
                {component}
              </Accordion.Item>
            );
          }),
          ...(isExperimental
            ? [
                <Accordion.Item
                  key="assignment-list"
                  id="assignment-list"
                  title="Assignment list"
                  unmountChildren
                >
                  <AssignmentListPanel />
                </Accordion.Item>,
              ]
            : []),
        ]}
      </Accordion>
    </Container>
  );
}

function RightButtons(props: { id: keyof NMRiumPanelPreferences }) {
  const { id } = props;
  const toggle = useTogglePanel();
  function handleClosePanel(event: MouseEvent) {
    event?.stopPropagation();
    toggle(id);
  }

  return (
    <Toolbar>
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
