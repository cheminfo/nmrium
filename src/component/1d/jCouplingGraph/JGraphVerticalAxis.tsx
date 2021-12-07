import { useChartData } from '../../context/ChartContext';
import { LinearVerticalAxis } from '../../elements/linearAxis/LinearVerticalAxis';

import { useJGraph } from './JGraphContext';

export function JGraphVerticalAxis() {
  const { width, margin } = useChartData();
  const { height, scaleY } = useJGraph();

  if (!scaleY) return null;

  return (
    <svg style={{ overflow: 'visible' }} height={height + 20} width={60}>
      <LinearVerticalAxis
        x={20}
        y={0}
        scale={scaleY}
        height={height}
        showGrid
        width={width - margin.right}
      />
    </svg>
  );
}
