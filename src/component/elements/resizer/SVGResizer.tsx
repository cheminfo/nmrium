/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { CSSProperties, useEffect } from 'react';

import { Position, ResizerProps } from './Resizer';
import useDraggable from './useDraggable';

const anchorStyle: CSSProperties = {
  width: '2px',
  height: '100%',
  pointerEvents: 'none',
  fill: 'transparent',
};
const styles = {
  container: (position: number) => css`
    transform: translateX(${position}px);

    &:hover {
      rect:last-child {
        fill: red !important;
      }
    }
  `,
  innerContainer: css`
    position: absolute;
    height: 100%;
    fill: transparent;
    width: 10px;
    cursor: e-resize;
    user-select: none;
    z-index: 99999999;
  `,
};

export default function SVGResizer(props: ResizerProps) {
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
    <g
      style={{
        transform: `translateX(${left.position.x}px)`,
      }}
    >
      {typeof children === 'function'
        ? children?.(left.position.x, right.position.x)
        : children}
      <g
        onMouseDown={right.onMouseDown}
        css={styles.container(right.position.x - left.position.x)}
      >
        <rect x="-5px" css={styles.innerContainer} />
        <rect x="-2.5px" style={anchorStyle} />
      </g>
      <g onMouseDown={left.onMouseDown} css={styles.container(0)}>
        <rect x="-5px" css={styles.innerContainer} />
        <rect x="-2.5px" style={anchorStyle} />
      </g>
    </g>
  );
}
