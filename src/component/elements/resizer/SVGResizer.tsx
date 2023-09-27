/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { CSSProperties } from 'react';

import { ResizerProps } from './Resizer';
import useResizer from './useResizer';

const style: Record<'anchor' | 'innerContainer', CSSProperties> = {
  anchor: {
    width: '2px',
    height: '100%',
    pointerEvents: 'none',
    fill: 'transparent',
  },
  innerContainer: {
    position: 'absolute',
    height: '100%',
    fill: 'transparent',
    width: '10px',
    cursor: 'e-resize',
    userSelect: 'none',
    zIndex: 99999999,
  },
};

const styles = {
  container: css`
    &:hover {
      rect:last-child {
        fill: red !important;
      }
    }
  `,
};

export default function SVGResizer(props: ResizerProps) {
  const { children, disabled } = props;
  const { left, right, currentPosition, isActive } = useResizer(props);

  return (
    <g transform={`translate(${currentPosition.x1} 0)`}>
      {typeof children === 'function'
        ? children(currentPosition, isActive)
        : children}
      {!disabled && (
        <>
          {' '}
          <SVGResizerHandle onPointerDown={left.onPointerDown} position={0} />
          <SVGResizerHandle
            onPointerDown={right.onPointerDown}
            position={Math.ceil(currentPosition.x2 - currentPosition.x1)}
          />
        </>
      )}
    </g>
  );
}

function SVGResizerHandle(props: {
  onPointerDown: React.PointerEventHandler<SVGAElement>;
  position: number;
}) {
  return (
    <g
      onPointerDown={props.onPointerDown}
      css={styles.container}
      style={{ transform: `translateX(${props.position}px)` }}
      data-no-export="true"
    >
      <rect x="-5px" style={style.innerContainer} />
      <rect x="-2.5px" style={style.anchor} />
    </g>
  );
}
