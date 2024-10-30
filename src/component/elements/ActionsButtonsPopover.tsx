/** @jsxImportSource @emotion/react */
import type { PopoverProps } from '@blueprintjs/core';
import { Popover } from '@blueprintjs/core';
import type { Interpolation, Theme } from '@emotion/react';
import { css } from '@emotion/react';
import type { CSSProperties } from 'react';
import type { ButtonProps } from 'react-science/ui';
import { Button } from 'react-science/ui';

export interface ActionsButtonsPopoverProps
  extends Omit<PopoverProps, 'interactionKind' | 'content'> {
  buttons: Array<
    Pick<
      ButtonProps,
      'icon' | 'onClick' | 'intent' | 'disabled' | 'onPointerDown' | 'style'
    > & {
      title?: string;
      visible?: boolean;
      css?: Interpolation<Theme>;
    }
  >;
  contentStyle?: CSSProperties;
  direction?: 'column' | 'row';
  space?: number;
}

export function ActionsButtonsPopover(props: ActionsButtonsPopoverProps) {
  const {
    buttons,
    children,
    space,
    direction = 'column',
    contentStyle = {},
    ...otherProps
  } = props;

  return (
    <Popover
      minimal
      position="auto-start"
      popoverClassName="actions-buttons-popover"
      interactionKind="hover"
      enforceFocus={false}
      content={
        <div
          style={{
            display: 'flex',
            flexDirection: direction,
            gap: space,
            ...contentStyle,
          }}
          css={css`
            button,
            a[role='button'] {
              border-radius: 50%;
              min-width: 16px;
              min-height: 16px;
              font-size: 10px;
              padding: 5px;
            }
          `}
        >
          {buttons
            .filter((button) => button?.visible !== false)
            .map(({ title, visible, ...otherProps }, index) => (
              <Button
                key={title || index}
                tooltipProps={{ content: title || '', compact: true }}
                {...otherProps}
              />
            ))}
        </div>
      }
      {...otherProps}
    >
      {children}
    </Popover>
  );
}
