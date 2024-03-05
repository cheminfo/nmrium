import { Menu, MenuItem, MenuItemProps } from '@blueprintjs/core';
import {
  Toolbar,
  ToolbarPopoverItemProps as BaseToolbarPopoverItemProps,
  ToolbarItemProps,
} from 'react-science/ui';

export interface ToolbarPopoverMenuItem extends MenuItemProps {
  data?: object;
}

interface ToolbarPopoverItemProps
  extends Omit<
      BaseToolbarPopoverItemProps,
      'onClick' | 'content' | 'itemProps'
    >,
    ToolbarItemProps {
  options: ToolbarPopoverMenuItem[];
  onClick: (data?: object) => void;
}

export function ToolbarPopoverItem(props: ToolbarPopoverItemProps) {
  const { options, onClick, ...itemProps } = props;

  return (
    <Toolbar.PopoverItem
      content={
        <Menu>
          {options.map((option) => {
            const { data, ...otherOptions } = option;
            return (
              <MenuItem
                key={JSON.stringify(option)}
                {...otherOptions}
                onClick={() => onClick(data)}
              />
            );
          })}
        </Menu>
      }
      itemProps={itemProps}
    />
  );
}
