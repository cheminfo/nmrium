import { ReactFragment } from 'react';

import DivResizer from './DivResizer';
import SVGResizer from './SVGResizer';

export interface Position {
  x1: number;
  x2: number;
}

type ChildType =
  | Array<React.ReactElement>
  | React.ReactElement
  | ReactFragment
  | boolean
  | null;

export interface ResizerProps {
  children?: ChildType | ((x1: number, x2: number) => ChildType);
  initialPosition?: Position;
  position?: Position;
  onStart?: PositionChangeHandler;
  onMove?: PositionChangeHandler;
  onEnd?: PositionChangeHandler;
  tag?: 'div' | 'svg';
}

type PositionChangeHandler = (data: Position) => void;

export default function Resizer(props: ResizerProps) {
  const { tag = 'div', ...resProps } = props;
  if (tag === 'div') {
    return <DivResizer {...resProps} />;
  } else {
    return <SVGResizer {...resProps} />;
  }
}
