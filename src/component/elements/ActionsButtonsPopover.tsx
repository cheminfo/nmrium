/** @jsxImportSource @emotion/react */
import { Popover, PopoverProps } from '@blueprintjs/core';
import { css, Interpolation, Theme } from '@emotion/react';
import { CSSProperties, Fragment } from 'react';
import { Button, ButtonProps } from 'react-science/ui';

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
          style={{ display: 'flex', flexDirection: direction, ...contentStyle }}
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
            .map(({ title, ...otherProps }, index, array) => (
              <Fragment key={title || index}>
                <Button
                  tooltipProps={{ content: title || '', compact: true }}
                  {...otherProps}
                />
                {index < array.length - 1 && (
                   
                  <div
                    key={`spacer-${index}`}
                    style={{
                      margin:
                        direction === 'row' ? `0 ${space}px` : `${space}px 0`,
                    }}
                  />
                )}
              </Fragment>
            ))}
        </div>
      }
      {...otherProps}
    >
      {children}
    </Popover>
  );
}
