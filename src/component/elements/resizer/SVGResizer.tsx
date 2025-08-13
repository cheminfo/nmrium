/* eslint-disable react/no-unused-prop-types */
import styled from '@emotion/styled';
import type { CSSProperties } from 'react';

import useResizer from './useResizer.js';

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

const Group = styled.g`
  :hover {
    rect:last-child {
      fill: red !important;
    }
  }
`;

export interface Position {
  x1: number;
  x2: number;
}

type ChildType = React.ReactElement[] | React.ReactElement | boolean | null;

export interface ResizerProps {
  children?: ChildType | ((position: Position, isActive: boolean) => ChildType);
  position: Position;
  onStart?: PositionChangeHandler;
  onMove?: PositionChangeHandler;
  onEnd?: PositionChangeHandler;
  parentElement?: HTMLElement | null;
  dragHandleClassName?: string;
  disabled?: boolean;
}

type PositionChangeHandler = (data: Position) => void;

export default function SVGResizer(props: ResizerProps) {
  const { children, disabled, position } = props;
  const { left, right, isActive } = useResizer(props);

  return (
    <g transform={`translate(${position.x1} 0)`}>
      {typeof children === 'function' ? children(position, isActive) : children}
      {!disabled && (
        <>
          {' '}
          <SVGResizerHandle onPointerDown={left.onPointerDown} position={0} />
          <SVGResizerHandle
            onPointerDown={right.onPointerDown}
            position={Math.ceil(position.x2 - position.x1)}
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
    <Group
      onPointerDown={props.onPointerDown}
      transform={`translate(${props.position})`}
      data-no-export="true"
    >
      <rect x="-5px" style={style.innerContainer} />
      <rect x="-2.5px" style={style.anchor} />
    </Group>
  );
}
