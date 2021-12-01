import { useState } from 'react';

import { useJGraph } from './JGraph';

interface JsCouplingProps {
  value: number;
}

export default function JsCoupling({ value }: JsCouplingProps) {
  const { scaleY } = useJGraph();
  const [isOver, setOver] = useState<boolean>(false);

  return (
    <g
      className="coupling"
      style={{ transform: `translate(0px,${scaleY(value)}px)` }}
    >
      <circle
        onMouseEnter={() => setOver(true)}
        onMouseLeave={() => setOver(false)}
        cx={0}
        cy={0}
        r={5}
        fill={isOver ? 'red' : '#a4a4a4'}
        strokeWidth="1"
        stroke="black"
        pointerEvents="all"
      />
      {isOver && (
        <g style={{ transform: `translate(0px,15px)` }}>
          <text
            pointerEvents="none"
            stroke="white"
            strokeWidth="0.6em"
            fontSize="10px"
            dominantBaseline="middle"
            textAnchor="middle"
          >{`${value.toFixed(1)} Hz`}</text>
          <text
            pointerEvents="none"
            stroke="red"
            strokeWidth="1px"
            fontSize="10px"
            dominantBaseline="middle"
            textAnchor="middle"
          >{`${value.toFixed(1)} Hz`}</text>
        </g>
      )}
    </g>
  );
}
