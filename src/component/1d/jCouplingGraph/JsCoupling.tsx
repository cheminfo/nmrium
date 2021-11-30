import { Signal1D } from '../../../data/types/data1d';
import { useScaleChecked } from '../../context/ScaleContext';

import { useJGraph } from './JGraph';
import { VerticalLine } from './VerticalLine';

interface JsCouplingProps {
  signals: Signal1D[];
}

export default function JsCoupling(props: JsCouplingProps) {
  const { scaleX } = useScaleChecked();
  const { scaleY, height } = useJGraph();

  return (
    <g className="js-coupling">
      {props.signals.map((signal) => {
        return (
          <g
            key={signal.id}
            transform={`translate(${scaleX()(signal.delta)},0)`}
          >
            <VerticalLine length={height} />
            {signal.js?.map((j) => {
              return (
                <circle
                  key={`${j.coupling}`}
                  cx={0}
                  cy={scaleY(j.coupling)}
                  r={5}
                  fill="#a4a4a4"
                  strokeWidth="1"
                  stroke="black"
                />
              );
            })}
          </g>
        );
      })}
    </g>
  );
}
