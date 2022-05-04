/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { CSSProperties, MouseEventHandler } from 'react';

import { ResizerProps } from './Resizer';
import useResizer from './useResizer';

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
  const { children } = props;
  const { left, right, currentPosition, isActive } = useResizer(props);

  return (
    <g
      style={{
        transform: `translateX(${currentPosition.x1}px)`,
      }}
    >
      {typeof children === 'function'
        ? children(currentPosition, isActive)
        : children}
      <SVGResizerHandle onMouseDown={left.onMouseDown} position={0} />
      <SVGResizerHandle
        onMouseDown={right.onMouseDown}
        position={Math.ceil(currentPosition.x2 - currentPosition.x1)}
      />
    </g>
  );
}

function SVGResizerHandle(props: {
  onMouseDown: MouseEventHandler<SVGGElement>;
  position: number;
}) {
  return (
    <g
      onMouseDown={props.onMouseDown}
      css={styles.container(props.position)}
      data-no-export="true"
    >
      <rect x="-5px" css={styles.innerContainer} />
      <rect x="-2.5px" style={anchorStyle} />
    </g>
  );
}
