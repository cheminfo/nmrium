import {
  Button,
  Classes,
  DialogProps,
  H6,
  HTMLDivProps,
  Icon,
  IconSize,
  mergeRefs,
  Overlay2,
  OverlayProps,
} from '@blueprintjs/core';
import { SmallCross } from '@blueprintjs/icons';
import { useRef } from 'react';

interface Position {
  x: number;
  y: number;
}
interface RectPosition extends Position {
  clientX: number;
  clientY: number;
}

type DraggableDialogProps = Omit<DialogProps, 'hasBackdrop'> &
  Pick<OverlayProps, 'hasBackdrop'>;

export function DraggableDialog(props: DraggableDialogProps) {
  const {
    children,
    containerRef,
    role,
    style,
    className = '',
    isCloseButtonShown,
    onClose,
    icon,
    title,
    ...otherProps
  } = props;
  const offsetRef = useRef<RectPosition>({
    x: 0,
    y: 0,
    clientX: 0,
    clientY: 0,
  });
  const originRef = useRef<Position | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  function handleMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    const target = event.currentTarget as HTMLElement;

    if (!dialogRef.current) {
      return;
    }

    const dialogRect = target.getBoundingClientRect();

    if (!originRef.current) {
      originRef.current = {
        x: dialogRect.x,
        y: dialogRect.y,
      };
    }

    offsetRef.current = {
      x: dialogRect.x,
      y: dialogRect.y,
      clientX: event.clientX,
      clientY: event.clientY,
    };

    function handleMouseMove(event: MouseEvent) {
      target.style.cursor = 'move';

      if (!dialogRef.current || !offsetRef.current || !originRef.current) {
        return;
      }

      const newX =
        offsetRef.current.x +
        (event.clientX - (offsetRef.current.clientX + originRef.current.x));
      const newY =
        offsetRef.current.y +
        (event.clientY - (offsetRef.current.clientY + originRef.current.y));

      dialogRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
    }
    function handleMouseUp() {
      target.style.cursor = 'default';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }

  return (
    <Overlay2 {...otherProps} childRef={dialogRef} onClose={onClose}>
      <div
        className={Classes.DIALOG_CONTAINER}
        ref={
          containerRef === undefined
            ? dialogRef
            : mergeRefs(containerRef, dialogRef)
        }
      >
        <div
          className={`${Classes.DIALOG} ${className}`}
          role={role}
          style={style}
        >
          <Header
            {...{ isCloseButtonShown, onClose, icon, title }}
            onMouseDown={handleMouseDown}
          />
          {children}
        </div>
      </div>
    </Overlay2>
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

function Header(
  props: Pick<
    DialogProps,
    'icon' | 'title' | 'isCloseButtonShown' | 'onClose'
  > &
    Pick<HTMLDivProps, 'onMouseDown'>,
) {
  const { icon, title, onMouseDown, ...otherProps } = props;
  if (title == null) {
    return null;
  }

  return (
    <div className={Classes.DIALOG_HEADER} onMouseDown={onMouseDown}>
      <Icon icon={icon} size={IconSize.STANDARD} tabIndex={-1} />
      <H6>{title}</H6>
      <CloseButton {...otherProps} />
    </div>
  );
}
