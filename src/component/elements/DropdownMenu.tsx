import {
  Menu,
  MenuItem,
  MenuItemProps,
  Popover,
  PopoverProps,
} from '@blueprintjs/core';

export interface DropdownMenuItem extends MenuItemProps {
  data?: object;
}

export interface DropdownMenuProps
  extends Omit<PopoverProps, 'onSelect' | 'content'> {
  options: DropdownMenuItem[];
  onSelect: (data?: object) => void;
}

export function DropdownMenu(props: DropdownMenuProps) {
  const { options, onSelect, children, ...other } = props;

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

  return (
    <Popover {...other} content={content}>
      {children}
    </Popover>
  );
}
