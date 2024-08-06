import {
  ContextMenuProps as BluePrintContextMenuProps,
  Menu,
  MenuItem,
  MenuItemProps,
  showContextMenu,
  Tooltip,
  TooltipProps,
} from '@blueprintjs/core';
import React, { ComponentProps, ElementType, ReactNode } from 'react';

export type ContextMenuCheck = boolean | ((data: any) => boolean);
export interface ContextMenuItem extends Omit<MenuItemProps, 'disabled'> {
  data?: object;
  tooltip?: TooltipProps;
  disabled?: ContextMenuCheck;
  visible?: ContextMenuCheck;
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
  data?: any;
}

export function ContextMenu<E extends ElementType = 'div'>(
  props: ContextMenuProps<E> & ElementProps<E>,
) {
  const {
    options,
    onSelect,
    children,
    as: Wrapper = 'div',
    data,
    ...other
  } = props;

  function handleContextMenu(event: React.MouseEvent<HTMLElement>) {
    if (!Array.isArray(options) || options.length === 0) {
      return;
    }

    const content = (
      <Menu>
        {options
          .filter(({ visible = true }) =>
            typeof visible === 'function' ? visible(data) : visible,
          )
          .map(({ tooltip = {}, ...options }) => {
            const { disabled = false, visible, ...otherOptions } = options;

            const isDisabled =
              typeof disabled === 'function' ? disabled(data) : disabled;

            return (
              <Tooltip
                disabled={!tooltip?.content}
                renderTarget={({ isOpen, ...targetProps }) => (
                  <div {...targetProps}>
                    <MenuItem
                      disabled={isDisabled}
                      {...otherOptions}
                      onClick={() => onSelect(otherOptions?.data)}
                    />
                  </div>
                )}
                key={otherOptions.text}
                {...tooltip}
              />
            );
          })}
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
