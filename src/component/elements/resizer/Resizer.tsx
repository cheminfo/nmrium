import DivResizer from './DivResizer';
import SVGResizer from './SVGResizer';

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
  tag?: 'div' | 'svg';
  parentElement?: HTMLElement | null;
  dragHandleClassName?: string;
  disabled?: boolean;
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
