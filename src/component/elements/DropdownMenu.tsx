import { Menu, MenuItem, MenuItemProps } from '@blueprintjs/core';
import {
  Toolbar,
  ToolbarPopoverItemProps,
  ToolbarItemProps,
} from 'react-science/ui';

export interface DropdownMenuItem extends MenuItemProps {
  data?: object;
}

export interface DropdownMenuProps
  extends Omit<ToolbarPopoverItemProps, 'onClick' | 'content' | 'itemProps'>,
    ToolbarItemProps {
  options: DropdownMenuItem[];
  onClick: (data?: object) => void;
}

export function DropdownMenu(props: DropdownMenuProps) {
  const { options, onClick, ...itemProps } = props;

  return (
    <Toolbar.PopoverItem
      content={
        <Menu>
          {options.map((option) => {
            const { data, ...otherOptions } = option;
            return (
              <MenuItem
                key={JSON.stringify(options)}
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
