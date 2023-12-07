import {
  ContextMenuProps as BluePrintContextMenuProps,
  Menu,
  MenuItem,
  MenuItemProps,
  showContextMenu,
} from '@blueprintjs/core';
import React, { ComponentProps, ElementType, ReactNode } from 'react';

export interface ContextMenuItem extends MenuItemProps {
  data?: object;
}

type ElementProps<E = 'div'> = E extends ElementType
  ? ComponentProps<E>
  : never;

export interface BaseContextMenuProps {
  options: ContextMenuItem[];
  onSelect: (data?: object) => void;
}

export interface ContextMenuProps<E>
  extends BaseContextMenuProps,
    Omit<BluePrintContextMenuProps, 'onSelect' | 'content' | 'children'> {
  as?: E;
  children: ReactNode;
}

export function ContextMenu<E extends ElementType = 'div'>(
  props: ContextMenuProps<E> & ElementProps<E>,
) {
  const { options, onSelect, children, as: Wrapper = 'div', ...other } = props;

  function handleContextMenu(event: React.MouseEvent<HTMLElement>) {
    if (!Array.isArray(options) || options.length === 0) {
      return;
    }

    const content = (
      <Menu>
        {options.map((option) => (
          <MenuItem
            key={JSON.stringify(option)}
            {...option}
            onClick={() => onSelect(option?.data)}
          />
        ))}
      </Menu>
    );

    event.preventDefault();
    showContextMenu({
      content,
      targetOffset: {
        left: event.clientX,
        top: event.clientY,
      },
    });
  }

  return (
    <Wrapper {...other} onContextMenu={handleContextMenu}>
      {children}
    </Wrapper>
  );
}
