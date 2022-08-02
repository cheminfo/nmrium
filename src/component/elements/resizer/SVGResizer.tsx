/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { CSSProperties, MouseEventHandler } from 'react';

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
    <g
      style={{
        transform: `translateX(${currentPosition.x1}px)`,
      }}
    >
      {typeof children === 'function'
        ? children(currentPosition, isActive)
        : children}
      {!disabled && (
        <>
          {' '}
          <SVGResizerHandle onMouseDown={left.onMouseDown} position={0} />
          <SVGResizerHandle
            onMouseDown={right.onMouseDown}
            position={Math.ceil(currentPosition.x2 - currentPosition.x1)}
          />
        </>
      )}
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
      css={styles.container}
      style={{ transform: `translateX(${props.position}px)` }}
      data-no-export="true"
    >
      <rect x="-5px" style={style.innerContainer} />
      <rect x="-2.5px" style={style.anchor} />
    </g>
  );
}
