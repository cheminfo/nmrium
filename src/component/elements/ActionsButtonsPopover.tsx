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

const HorizontalSeparator = styled.div`
  border-left: 1px solid #dedede;
  margin: auto 5px;
  width: 1px;
  height: 10px;
`;
const VerticalSeparator = styled.div`
  border-top: 1px solid #dedede;
  margin: 5px auto;
  width: 10px;
  height: 1px;
`;

interface PopoverButtonProps extends ButtonProps {
  title?: string;
  visible?: boolean;
  css?: Interpolation<Theme>;
}

type ActionButtonProps = PopoverButtonProps | { elementType: 'separator' };

function isSeparator(
  element: ActionButtonProps,
): element is { elementType: 'separator' } {
  return 'elementType' in element && element.elementType === 'separator';
}

type Direction = 'column' | 'row';

export interface ActionsButtonsPopoverProps
  extends Omit<PopoverProps, 'interactionKind' | 'content'> {
  buttons: ActionButtonProps[];
  contentStyle?: CSSProperties;
  direction?: Direction;
  space?: number;
}

function ActionButton(props: ButtonProps) {
  return <Button {...props} />;
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

  const visibleButtons = buttons.filter(
    (button) => isSeparator(button) || button?.visible !== false,
  );

  return (
    <Popover
      minimal
      position="auto-start"
      popoverClassName="actions-buttons-popover"
      interactionKind="hover"
      enforceFocus={false}
      content={
        <Container style={contentStyle} flexDirection={direction} gap={space}>
          <ActionButtons buttons={visibleButtons} direction={direction} />
        </Container>
      }
      {...otherProps}
    >
      {children}
    </Popover>
  );
}
interface ActionButtonsProps {
  buttons: ActionButtonProps[];
  direction: Direction;
}

function ActionButtons(props: ActionButtonsProps) {
  const { buttons, direction } = props;

  return buttons.map((button, index) => {
    if (isSeparator(button)) {
      if (direction === 'row') {
        // eslint-disable-next-line react/no-array-index-key
        return <HorizontalSeparator key={index} />;
      }

      // eslint-disable-next-line react/no-array-index-key
      return <VerticalSeparator key={index} />;
    }

    const { title, visible, ...otherProps } = button;

    return (
      <ActionButton
        // eslint-disable-next-line react/no-array-index-key
        key={index}
        tooltipProps={{ content: title || '', compact: true }}
        {...otherProps}
      />
    );
  });
}
