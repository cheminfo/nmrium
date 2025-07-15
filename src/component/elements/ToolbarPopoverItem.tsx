import type { MenuItemProps } from '@blueprintjs/core';
import { Menu, MenuItem } from '@blueprintjs/core';
import type {
  ToolbarItemProps,
  ToolbarPopoverItemProps,
} from 'react-science/ui';
import { Toolbar } from 'react-science/ui';

export interface ToolbarPopoverMenuItem<T = object> extends MenuItemProps {
  data?: T;
}

interface CustomToolbarPopoverItemProps<T = object>
  extends Omit<ToolbarPopoverItemProps, 'onClick' | 'content' | 'itemProps'>,
    Pick<
      ToolbarItemProps,
      'tooltip' | 'icon' | 'tooltipProps' | 'active' | 'id'
    > {
  itemProps?: Omit<ToolbarItemProps, 'onClick' | 'disabled'>;
  options: Array<ToolbarPopoverMenuItem<T>>;
  onClick: (data?: T) => void;
}

export function ToolbarPopoverItem<T = object>(
  props: CustomToolbarPopoverItemProps<T>,
) {
  const {
    options,
    onClick,
    icon,
    tooltip,
    tooltipProps,
    active,
    id,
    itemProps,
    disabled,
    ...otherPopoverItemProps
  } = props;

  return (
    <Toolbar.PopoverItem
      disabled={disabled}
      {...otherPopoverItemProps}
      content={
        <Menu>
          {options.map((option) => {
            const { data, text, ...otherOptions } = option;
            return (
              <MenuItem
                text={text}
                key={JSON.stringify({ data, text })}
                {...otherOptions}
                onClick={() => onClick(data)}
              />
            );
          })}
        </Menu>
      }
      itemProps={{
        icon,
        tooltip,
        tooltipProps,
        active,
        id,
        disabled,
        ...itemProps,
      }}
    />
  );
}
