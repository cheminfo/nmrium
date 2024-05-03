/** @jsxImportSource @emotion/react */
import { Popover, PopoverProps } from '@blueprintjs/core';
import { css } from '@emotion/react';
import { Button, ButtonProps } from 'react-science/ui';

export interface ActionsButtonsPopoverProps
  extends Omit<PopoverProps, 'interactionKind' | 'content'> {
  buttons: Array<
    Pick<ButtonProps, 'icon' | 'onClick' | 'intent' | 'disabled'> & {
      title?: string;
      visible?: boolean;
    }
  >;
}

export function ActionsButtonsPopover(props: ActionsButtonsPopoverProps) {
  const { buttons, children, ...otherProps } = props;

  return (
    <Popover
      minimal
      position="auto-start"
      popoverClassName="actions-buttons-popover"
      interactionKind="hover"
      enforceFocus={false}
      content={
        <div
          style={{ display: 'flex', flexDirection: 'column' }}
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
            .map(({ icon, onClick, intent, title, disabled }, index) => {
              return (
                <Button
                  disabled={disabled}
                  key={title || index}
                  icon={icon}
                  onClick={onClick}
                  tooltipProps={{ content: title || '', compact: true }}
                  intent={intent}
                />
              );
            })}
        </div>
      }
      {...otherProps}
    >
      {children}
    </Popover>
  );
}
