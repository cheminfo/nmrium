import type { MenuItemProps } from '@blueprintjs/core';
import { Menu, MenuItem, Tooltip } from '@blueprintjs/core';
import type {
  ToolbarItemProps,
  ToolbarPopoverItemProps,
  TooltipItem,
} from 'react-science/ui';
import { Toolbar, TooltipHelpContent } from 'react-science/ui';

export interface ToolbarPopoverMenuItem<T = object>
  extends MenuItemProps, Pick<ToolbarItemProps, 'tooltipProps'> {
  data?: T;
  tooltip?: string | TooltipItem;
}

interface CustomToolbarPopoverItemProps<T = object>
  extends
    Omit<ToolbarPopoverItemProps, 'onClick' | 'content' | 'itemProps'>,
    Pick<
      ToolbarItemProps,
      'tooltip' | 'icon' | 'tooltipProps' | 'active' | 'id'
    > {
  itemProps?: Omit<ToolbarItemProps, 'onClick' | 'disabled'>;
  options: Array<ToolbarPopoverMenuItem<T>>;
  onClick?: (data?: T) => void;
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
      autoFocus={false}
      content={
        <Menu>
          {options.map((option) => {
            const {
              data,
              text,
              tooltip = '',
              tooltipProps,
              disabled,
              ...otherOptions
            } = option;
            return (
              <Tooltip
                key={JSON.stringify({ data, text })}
                disabled={disabled ?? !option.tooltip}
                content={
                  typeof tooltip === 'string' ? (
                    tooltip
                  ) : (
                    <TooltipHelpContent {...tooltip} />
                  )
                }
                {...(!tooltip
                  ? undefined
                  : {
                      compact: true,
                      minimal: true,
                      interactionKind: 'hover',
                      placement: 'right',
                      ...tooltipProps,
                    })}
                renderTarget={({ isOpen, ...props }) => (
                  <MenuItem
                    disabled={disabled}
                    text={text}
                    onClick={() => onClick?.(data)}
                    {...otherOptions}
                    {...props}
                  />
                )}
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
