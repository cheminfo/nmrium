import { useChartData } from '../../context/ChartContext.js';
import { LinearVerticalAxis } from '../../elements/linearAxis/LinearVerticalAxis.js';

import { useJGraph } from './JGraphContext.js';

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
