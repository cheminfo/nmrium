/* eslint-disable import/order */
import { CSSProperties } from 'react';

import { useScaleChecked } from '../../context/ScaleContext';
import { Signal1D } from '../../../data/types/data1d/Signal1D';

interface StringNodeProps {
  signal: Signal1D;
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
