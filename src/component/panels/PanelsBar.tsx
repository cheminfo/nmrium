import { ButtonGroup, Colors } from '@blueprintjs/core';
import styled from '@emotion/styled';
import type { NMRiumPanelPreferences } from '@zakodium/nmrium-core';
import { ActivityBarItem, Toolbar } from 'react-science/ui';
import useResizeObserver from 'use-resize-observer';

import { usePreferences } from '../context/PreferencesContext.js';
import type { ToolbarPopoverMenuItem } from '../elements/ToolbarPopoverItem.js';
import { ToolbarPopoverItem } from '../elements/ToolbarPopoverItem.js';

import { useAccordionItems } from './hooks/useAccordionItems.js';
import { useGetPanelOptions } from './hooks/useGetPanelOptions.js';
import { useTogglePanel } from './hooks/useTogglePanel.js';

const PanelsBarContainer = styled(ButtonGroup)`
  flex-wrap: nowrap;
  height: 100%;
  gap: 4px;
  padding: 4px;
  border-left: 1px solid ${Colors.LIGHT_GRAY4};
  background-color: ${Colors.WHITE};
`;

function useHiddenItemsMenu(
  items,
  sliceIndex,
): Array<ToolbarPopoverMenuItem<{ id: keyof NMRiumPanelPreferences }>> {
  const getPanelPreferences = useGetPanelOptions();
  const hiddenItems = items.slice(sliceIndex);

  return hiddenItems.map((item) => {
    const panelOptions = getPanelPreferences(item);
    return {
      icon: item.icon,
      text: item.title,
      active: panelOptions.display,
      data: {
        id: item.id,
      },
    };
  });
}

export function PanelsBar({ itemHeight = 44 }) {
  const { current } = usePreferences();

  const {
    display: { general = {} },
  } = current;
  const {
    ref,
    height,
    // @ts-expect-error Module is not published correctly.
  } = useResizeObserver();
  const getPanelPreferences = useGetPanelOptions();

  const sliceIndex = Math.floor((height - itemHeight) / itemHeight);

  const items = useAccordionItems();
  const visibleItems = items.filter((_, index) => index < sliceIndex);
  const menu = useHiddenItemsMenu(items, sliceIndex);
  const isMenuActive = menu.some((item) => item.active);

  const togglePanel = useTogglePanel();

  if (items.length === 0 || general?.hidePanelsBar) return null;

  return (
    <PanelsBarContainer vertical size="large" variant="minimal" ref={ref}>
      {visibleItems.map((item) => {
        const panelOptions = getPanelPreferences(item);
        return (
          <ActivityBarItem
            key={item.id}
            id={item.id}
            tooltip={item.title}
            icon={item.icon}
            active={panelOptions.display}
            onClick={() => togglePanel(item.id)}
          />
        );
      })}
      {menu.length > 0 && (
        <Toolbar>
          <ToolbarPopoverItem
            placement="left"
            tooltipProps={{ placement: 'left' }}
            options={menu}
            tooltip={`More panels [ +${menu.length} ]`}
            icon="more"
            onClick={(data) => {
              if (data?.id) {
                togglePanel(data.id);
              }
            }}
            active={isMenuActive}
          />
        </Toolbar>
      )}
    </PanelsBarContainer>
  );
}
