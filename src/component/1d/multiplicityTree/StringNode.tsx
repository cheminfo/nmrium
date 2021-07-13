import { CSSProperties } from 'react';

import { useScaleChecked } from '../../context/ScaleContext';

import { SignalNodeProps } from './MultiplicityTree';

interface StringNodeProps {
  signal: SignalNodeProps;
  startY: number;
  levelHeight: number;
  fontSize: CSSProperties['fontSize'];
  showLabels: boolean;
}

function StringNode({
  signal,
  startY,
  levelHeight,
  fontSize,
  showLabels,
}: StringNodeProps) {
  const { scaleX } = useScaleChecked();
  return (
    <text
      key={`multiplicityString_${signal.id}`}
      textAnchor="middle"
      x={scaleX()(signal.delta)}
      y={startY + levelHeight / 2}
      fontSize={fontSize}
      lengthAdjust="spacing"
      fill="black"
      visibility={showLabels ? 'visible' : 'hidden'}
    >
      {signal.multiplicity}
    </text>
  );
}

export default StringNode;
