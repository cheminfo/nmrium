import type { Signal1D } from 'nmr-processing';

import { useScaleChecked } from '../../context/ScaleContext.js';

import { useJGraph } from './JGraphContext.js';
import JsCoupling from './JsCoupling.js';

interface JsCouplingsProps {
  signals: Signal1D[];
}

export default function JsCouplings(props: JsCouplingsProps) {
  const { scaleX } = useScaleChecked();
  const { height } = useJGraph();

  return (
    <g className="js-coupling">
      {props.signals.map((signal) => {
        return (
          <g
            key={signal.id}
            transform={`translate(${scaleX()(signal.delta)},0)`}
          >
            <line
              x1="0"
              y1={height}
              x2="0"
              y2="0"
              stroke="black"
              strokeWidth="1"
            />
            {signal.js?.map((j) => {
              return <JsCoupling key={`${j.coupling}`} value={j.coupling} />;
            })}
          </g>
        );
      })}
    </g>
  );
}
