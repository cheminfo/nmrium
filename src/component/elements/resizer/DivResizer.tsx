/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { CSSProperties } from 'react';

import { Draggable } from '../draggble/useDraggable';

import { ResizerProps, Position } from './Resizer';
import useResizer from './useResizer';

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

  content: (left: Draggable, right: Draggable, prevPosition: Position) => {
    const width = prevPosition.x2 - prevPosition.x1;

    const baseCss = css`
      position: absolute;
      width: ${width}px;
      overflow: hidden;
    `;
    if (right.position.action === 'move' || left.position.action === 'move') {
      const scale = (right.position.value.x - left.position.value.x) / width;
      return [
        baseCss,
        css`
          transform: translateX(${left.position.value.x}px) scaleX(${scale});
          transform-origin: left center;
        `,
      ];
    } else {
      return css([
        baseCss,
        css`
          transform: translateX(${left.position.value.x}px);
        `,
      ]);
    }
  },
};

export default function DivResizer(props: ResizerProps) {
  const { children } = props;
  const { left, right, prevPosition, currentPosition, isActive } =
    useResizer(props);

  return (
    <>
      <div
        data-no-export="true"
        onMouseDown={right.onMouseDown}
        css={styles.container(right.position.value.x)}
      >
        <div style={anchorStyle} />
      </div>
      <div css={styles.content(left, right, prevPosition)}>
        {typeof children === 'function'
          ? children?.(currentPosition, isActive)
          : children}
      </div>
      <div
        data-no-export="true"
        onMouseDown={left.onMouseDown}
        css={styles.container(left.position.value.x)}
      >
        <div style={anchorStyle} />
      </div>
    </>
  );
}
