import type { PopoverProps } from '@blueprintjs/core';
import { Popover } from '@blueprintjs/core';
import type { Interpolation, Theme } from '@emotion/react';
import styled from '@emotion/styled';
import type { CSSProperties } from 'react';
import { useState } from 'react';
import type { ButtonProps } from 'react-science/ui';
import { Button } from 'react-science/ui';

const Container = styled.div<Pick<CSSProperties, 'flexDirection' | 'gap'>>`
  display: flex;
  flex-direction: ${(props) => props.flexDirection};
  gap: ${(props) => props.gap}px;

  button,
  a[role='button'] {
    border-radius: 50%;
    font-size: 10px;
    min-height: 16px;
    min-width: 16px;
    padding: 5px;
  }
`;

const HorizontalSeparator = styled.div`
  border-left: 1px solid #dedede;
  height: 10px;
  margin: auto 5px;
  width: 1px;
`;
const VerticalSeparator = styled.div`
  border-top: 1px solid #dedede;
  height: 1px;
  margin: 5px auto;
  width: 10px;
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

type AnchorTo = 'element' | 'cursor-x' | 'cursor-y' | 'cursor';

type AnchorPlacement = 'start' | 'end';

interface Position {
  x: number;
  y: number;
}
export interface ActionsButtonsPopoverProps
  extends
    Omit<
      PopoverProps,
      'interactionKind' | 'content' | 'modifiers' | 'renderTarget'
    >,
    Partial<Position> {
  buttons: ActionButtonProps[];
  contentStyle?: CSSProperties;
  direction?: Direction;
  space?: number;
  offsetX?: number;
  offsetY?: number;
  anchorTo?: AnchorTo;
  autoFlip?: boolean;
  anchorPlacement?: AnchorPlacement;
}

function ActionButton(props: ButtonProps) {
  return <Button {...props} />;
}

function filterButtons(buttons: ActionButtonProps[]) {
  const visibleButtons: ActionButtonProps[] = [];
  let disablePopover = true;

  for (const button of buttons) {
    const isSeparatorComponent = isSeparator(button);

    const show = isSeparatorComponent || button?.visible !== false;
    if (show) visibleButtons.push(button);

    if (!isSeparatorComponent && button?.visible !== false) {
      disablePopover = false;
    }
  }

  return { visibleButtons, disablePopover };
}

interface OffsetOptions {
  offsetX?: number;
  offsetY?: number;
  anchorTo?: AnchorTo;
  cursorPosition: Position;
}

function getOffset(options: OffsetOptions): [number, number] {
  const { anchorTo, cursorPosition, offsetX = 0, offsetY = 0 } = options;
  const isTrackX = anchorTo === 'cursor-x' || anchorTo === 'cursor';
  const isTrackY = anchorTo === 'cursor-y' || anchorTo === 'cursor';

  const x = isTrackX ? cursorPosition.x : 0;
  const y = isTrackY ? cursorPosition.y : 0;

  if (anchorTo === 'cursor-x') {
    return [x + offsetX, -offsetY];
  }

  if (anchorTo === 'cursor-y') {
    return [y + offsetY, offsetX];
  }

  if (anchorTo === 'cursor') {
    return [x + offsetX, -(y + offsetY)];
  }

  return [offsetX, -offsetY];
}

function getPlacement(
  anchorTo: AnchorTo,
  anchorPlacement: AnchorPlacement,
): PopoverProps['placement'] {
  switch (anchorTo) {
    case 'cursor-x':
      return `${anchorPlacement === 'start' ? 'top' : 'bottom'}-start`;
    case 'cursor-y':
      return `${anchorPlacement === 'start' ? 'left' : 'right'}-start`;
    case 'cursor':
      return 'top-start';
    default:
      return 'top-start';
  }
}

export function ActionsButtonsPopover(props: ActionsButtonsPopoverProps) {
  const {
    targetTagName = 'div',
    targetProps,
    buttons,
    children,
    space,
    direction = 'column',
    contentStyle = {},
    offsetX = 0,
    offsetY = 0,
    x,
    y,
    anchorTo = 'element',
    autoFlip = false,
    disabled,
    anchorPlacement = 'end',
    ...otherProps
  } = props;

  const [cursorPosition, setCursorPosition] = useState<Position>({
    x: 0,
    y: 0,
  });
  const Wrapper = targetTagName as any;

  const { visibleButtons, disablePopover } = filterButtons(buttons);

  function handleMouseEnter(event: any) {
    const { clientX, clientY, currentTarget } = event;
    if (!(currentTarget instanceof Element)) return;
    const rect = currentTarget.getBoundingClientRect();

    setCursorPosition({
      x: clientX - rect.left,
      y: clientY - rect.top,
    });
  }

  const placement = getPlacement(anchorTo, anchorPlacement);
  const offset = getOffset({ anchorTo, offsetX, offsetY, cursorPosition });
  return (
    <Popover
      minimal
      placement={placement}
      popoverClassName="actions-buttons-popover"
      interactionKind="hover"
      enforceFocus={false}
      onOpening={handleMouseEnter}
      disabled={disablePopover || disabled}
      renderTarget={({ onMouseEnter, ...otherProps }) => (
        <Wrapper
          {...targetProps}
          {...otherProps}
          onMouseEnter={(event: any) => {
            handleMouseEnter(event);
            onMouseEnter?.(event);
          }}
        >
          {children}
        </Wrapper>
      )}
      modifiers={{
        offset: {
          enabled: true,
          data: { x, y },
          options: {
            offset,
          },
        },

        flip: { enabled: autoFlip },
      }}
      content={
        <Container style={contentStyle} flexDirection={direction} gap={space}>
          <ActionButtons buttons={visibleButtons} direction={direction} />
        </Container>
      }
      {...otherProps}
    />
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
