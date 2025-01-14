import type { PopoverProps } from '@blueprintjs/core';
import { Popover } from '@blueprintjs/core';
import type { Interpolation, Theme } from '@emotion/react';
import styled from '@emotion/styled';
import type { CSSProperties } from 'react';
import type { ButtonProps } from 'react-science/ui';
import { Button } from 'react-science/ui';

const Container = styled.div<Pick<CSSProperties, 'flexDirection' | 'gap'>>`
  display: flex;
  flex-direction: ${(props) => props.flexDirection};
  gap: ${(props) => props.gap}px;

  button,
  a[role='button'] {
    border-radius: 50%;
    min-width: 16px;
    min-height: 16px;
    font-size: 10px;
    padding: 5px;
  }
`;

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
        <Container style={contentStyle} flexDirection={direction} gap={space}>
          {buttons
            .filter((button) => button?.visible !== false)
            .map(({ title, visible, ...otherProps }, index) => (
              <Button
                key={title || index}
                tooltipProps={{ content: title || '', compact: true }}
                {...otherProps}
              />
            ))}
        </Container>
      }
      {...otherProps}
    >
      {children}
    </Popover>
  );
}
