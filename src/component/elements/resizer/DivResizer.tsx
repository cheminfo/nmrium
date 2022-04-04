/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { CSSProperties, useEffect } from 'react';

import { Position, ResizerProps } from './Resizer';
import useDraggable, { Anchor, Draggable } from './useDraggable';

const anchorStyle: CSSProperties = {
  marginLeft: '5px',
  width: '2px',
  height: '100%',
  pointerEvents: 'none',
  position: 'relative',
};
const styles = {
  container: (position: number) => css`
    position: absolute;
    height: 100%;
    // background-color: red;
    width: 10px;
    left: -5px;
    cursor: e-resize;
    transform: translateX(${position}px);
    user-select: none;
    z-index: 99999999;

    &:hover {
      div {
        background-color: red;
      }
    }
  `,

  content: (anchorSide: Anchor | '', left: Draggable, right: Draggable) => {
    const width = right.previousPosition - left.previousPosition;

    const baseCss = css`
      position: absolute;
      width: ${width}px;
      overflow: hidden;
    `;
    if (right.position.action === 'move' || left.position.action === 'move') {
      const scale = (right.position.x - left.position.x) / width;
      if (anchorSide === 'RIGHT') {
        return [
          baseCss,
          css`
            transform: translateX(${left.position.x}px) scaleX(${scale});
            transform-origin: left center;
          `,
        ];
      } else if (anchorSide === 'LEFT') {
        return css([
          baseCss,
          css`
            transform: translateX(${left.position.x}px) scaleX(${scale});
            transform-origin: left center;
          `,
        ]);
      }
    } else {
      return css([
        baseCss,
        css`
          transform: translateX(${left.position.x}px);
        `,
      ]);
    }
  },
};

export default function DivResizer(props: ResizerProps) {
  const {
    children,
    initialPosition = { x1: 10, x2: 40 },
    onStart,
    onMove,
    onEnd,
  } = props;

  const right = useDraggable({
    x: initialPosition.x2,
    anchor: 'RIGHT',
  });
  const left = useDraggable({
    x: initialPosition.x1,
    anchor: 'LEFT',
  });

  const anchor = left.isActive
    ? left.anchor
    : right.isActive
    ? right.anchor
    : '';

  useEffect(() => {
    const position: Position = { x1: left.position.x, x2: right.position.x };
    const status = left.isActive
      ? left.position.action
      : right.isActive
      ? right.position.action
      : '';
    switch (status) {
      case 'start':
        onStart?.(position);
        break;
      case 'move':
        onMove?.(position);
        break;
      case 'end':
        onEnd?.(position);
        break;
      default:
        break;
    }
  }, [left, onEnd, onMove, onStart, right]);

  return (
    <>
      <div
        onMouseDown={right.onMouseDown}
        css={styles.container(right.position.x)}
      >
        <div style={anchorStyle} />
      </div>
      <div css={styles.content(anchor, left, right)}>
        {typeof children === 'function'
          ? children?.(left.position.x, right.position.x)
          : children}
      </div>
      <div
        onMouseDown={left.onMouseDown}
        css={styles.container(left.position.x)}
      >
        <div style={anchorStyle} />
      </div>
    </>
  );
}
