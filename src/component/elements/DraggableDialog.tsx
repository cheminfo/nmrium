/** @jsxImportSource @emotion/react */

import type {
  DialogProps,
  HTMLDivProps,
  OverlayProps,
} from '@blueprintjs/core';
import {
  Button,
  Classes,
  H6,
  Icon,
  IconSize,
  mergeRefs,
  Overlay2,
} from '@blueprintjs/core';
import { SmallCross } from '@blueprintjs/icons';
import { css, Global } from '@emotion/react';
import styled from '@emotion/styled';
import type { ReactNode, RefObject } from 'react';
import { useLayoutEffect, useRef } from 'react';

const Container = styled.div`
  min-height: 100%;
  pointer-events: none;
  user-select: none;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
`;

interface Position {
  x: number;
  y: number;
}

type DialogPlacement =
  | 'top'
  | 'bottom'
  | 'center'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'center-left'
  | 'center-right';

interface HeaderElement {
  headerLeftElement?: ReactNode;
  headerRightElement?: ReactNode;
}

interface DraggableDialogProps
  extends Omit<DialogProps, 'hasBackdrop'>,
    Pick<OverlayProps, 'hasBackdrop'>,
    HeaderElement {
  placement?: DialogPlacement;
}

interface InnerDraggableDialogProps extends DraggableDialogProps {
  innerDialogRef: RefObject<HTMLDivElement>;
}
export function DraggableDialog(props: DraggableDialogProps) {
  const {
    onClose,
    headerLeftElement,
    headerRightElement,
    placement,
    hasBackdrop,
    ...otherProps
  } = props;

  const dialogRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <Global
        styles={css`
          div[class*='-portal']:has(.draggable-portal) {
            height: 100%;
            pointer-events: ${hasBackdrop === undefined || hasBackdrop
              ? 'all'
              : 'none'};
          }
        `}
      />
      <Overlay2
        {...otherProps}
        childRef={dialogRef}
        onClose={onClose}
        className="draggable-portal"
        hasBackdrop={hasBackdrop}
      >
        <InnerDraggableDialog innerDialogRef={dialogRef} {...props} />
      </Overlay2>
    </>
  );
}
function InnerDraggableDialog(props: InnerDraggableDialogProps) {
  const {
    children,
    containerRef,
    role = 'dialog',
    style,
    className = '',
    isCloseButtonShown,
    onClose,
    icon,
    title,
    headerLeftElement,
    headerRightElement,
    placement = 'center',
    innerDialogRef,
  } = props;
  const offsetRef = useRef<Position>({
    x: 0,
    y: 0,
  });
  const containerRefInternal = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const updateTransform = () => {
      if (!innerDialogRef.current || !containerRefInternal.current) {
        return;
      }
      const dialogRect = innerDialogRef.current.getBoundingClientRect();
      const parentContainerRect =
        containerRefInternal.current.getBoundingClientRect();
      const { transformX, transformY } = calculateTransform(placement, {
        dialogRect,
        parentContainerRect,
      });

      innerDialogRef.current.style.transform = `translate(${transformX}px, ${transformY}px)`;
    };

    const frameId = requestAnimationFrame(updateTransform);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [innerDialogRef, placement]);

  function handleMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    const target = event.currentTarget as HTMLElement;

    if (!containerRefInternal.current) {
      return;
    }

    const dialogRect = target.getBoundingClientRect();
    const containerRect = containerRefInternal.current.getBoundingClientRect();

    const offsetX = event.clientX - (dialogRect.left - containerRect.left);
    const offsetY = event.clientY - (dialogRect.top - containerRect.top);

    offsetRef.current = {
      x: offsetX,
      y: offsetY,
    };

    function handleMouseMove(event: MouseEvent) {
      target.style.cursor = 'move';
      if (!innerDialogRef.current || !offsetRef.current) {
        return;
      }
      const offsetX = event.clientX - offsetRef.current.x;
      const offsetY = event.clientY - offsetRef.current.y;

      innerDialogRef.current.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    }
    function handleMouseUp() {
      target.style.cursor = 'default';
      globalThis.removeEventListener('mousemove', handleMouseMove);
      globalThis.removeEventListener('mouseup', handleMouseUp);
    }

    globalThis.addEventListener('mousemove', handleMouseMove);
    globalThis.addEventListener('mouseup', handleMouseUp);
  }

  return (
    <Container ref={containerRefInternal}>
      <div
        ref={
          containerRef === undefined
            ? innerDialogRef
            : mergeRefs(containerRef, innerDialogRef)
        }
        className={`${Classes.DIALOG} ${className}`}
        role={role}
        style={{
          ...style,
          position: 'fixed',
          margin: 0,
        }}
      >
        <Header
          {...{
            isCloseButtonShown,
            onClose,
            icon,
            title,
            headerLeftElement,
            headerRightElement,
          }}
          onMouseDown={handleMouseDown}
        />
        {children}
      </div>
    </Container>
  );
}

function CloseButton(
  props: Pick<DialogProps, 'isCloseButtonShown' | 'onClose'>,
) {
  const { isCloseButtonShown = true, onClose } = props;

  if (!isCloseButtonShown) {
    return null;
  }

  return (
    <Button
      aria-label="Close"
      className={Classes.DIALOG_CLOSE_BUTTON}
      icon={<SmallCross size={IconSize.STANDARD} />}
      minimal
      onClick={onClose}
    />
  );
}

type HeaderProps = Pick<
  DialogProps,
  'icon' | 'title' | 'isCloseButtonShown' | 'onClose'
> &
  Pick<HTMLDivProps, 'onMouseDown'> &
  HeaderElement;

function Header(props: HeaderProps) {
  const {
    icon,
    title,
    onMouseDown,
    headerRightElement,
    headerLeftElement,
    ...otherProps
  } = props;
  if (title == null) {
    return null;
  }

  return (
    <div className={Classes.DIALOG_HEADER} onMouseDown={onMouseDown}>
      <Icon icon={icon} size={IconSize.STANDARD} tabIndex={-1} />
      {headerLeftElement}
      <H6>{title}</H6>
      {headerRightElement}
      <CloseButton {...otherProps} />
    </div>
  );
}

function calculateTransform(
  placement: DialogPlacement,
  option: {
    dialogRect: DOMRect;
    parentContainerRect: DOMRect;
  },
): { transformX: number; transformY: number } {
  let transformX = 0;
  let transformY = 0;
  const { parentContainerRect, dialogRect } = option;
  switch (placement) {
    case 'top':
      transformX = (parentContainerRect.width - dialogRect.width) / 2;
      transformY = 0;
      break;
    case 'bottom':
      transformX = (parentContainerRect.width - dialogRect.width) / 2;
      transformY = parentContainerRect.height - dialogRect.height;
      break;
    case 'center':
      transformX = (parentContainerRect.width - dialogRect.width) / 2;
      transformY = (parentContainerRect.height - dialogRect.height) / 2;
      break;
    case 'top-left':
      transformX = 0;
      transformY = 0;
      break;
    case 'top-right':
      transformX = parentContainerRect.width - dialogRect.width;
      transformY = 0;
      break;
    case 'bottom-left':
      transformX = 0;
      transformY = parentContainerRect.height - dialogRect.height;
      break;
    case 'bottom-right':
      transformX = parentContainerRect.width - dialogRect.width;
      transformY = parentContainerRect.height - dialogRect.height;
      break;
    case 'center-left':
      transformX = 0;
      transformY = (parentContainerRect.height - dialogRect.height) / 2;
      break;
    case 'center-right':
      transformX = parentContainerRect.width - dialogRect.width;
      transformY = (parentContainerRect.height - dialogRect.height) / 2;
      break;
    default:
      break;
  }

  return { transformX, transformY };
}
