import { useState } from 'react';

import { useJGraph } from './JGraphContext';

interface JsCouplingProps {
  value: number;
}

export default function JsCoupling({ value }: JsCouplingProps) {
  const { scaleY, maxValue } = useJGraph();
  const [isOver, setOver] = useState<boolean>(false);

  if (!scaleY) return null;

  return (
    <g className="coupling" transform={`translate(0 ${scaleY(value)})`}>
      <circle
        onMouseEnter={() => setOver(true)}
        onMouseLeave={() => setOver(false)}
        cx={0}
        cy={0}
        r={4}
        fill={`hsl(${(value * 360) / maxValue},100%,${isOver ? 45 : 50}%)`}
        pointerEvents="all"
      />
      {isOver && (
        <g transform="translate(0 15)">
          <text
            pointerEvents="none"
            stroke="white"
            strokeWidth="0.6em"
            fontSize="11px"
            dominantBaseline="middle"
            textAnchor="end"
          >{`${value.toFixed(1)} Hz`}</text>
          <text
            pointerEvents="none"
            stroke="black"
            fontSize="11px"
            dominantBaseline="middle"
            textAnchor="end"
          >{`${value.toFixed(1)} Hz`}</text>
        </g>
      )}
    </g>
  );
}
