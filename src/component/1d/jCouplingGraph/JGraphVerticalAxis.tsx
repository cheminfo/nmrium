import { scaleLinear } from 'd3';

import { useChartData } from '../../context/ChartContext';
import { LinearVerticalAxis } from '../../elements/linearAxis/LinearVerticalAxis';

import { useJGraph } from './JGraph';

export function JGraphVerticalAxis() {
  const { width, margin } = useChartData();
  const { height, maxValue } = useJGraph();
  const scale = scaleLinear().range([height, 0]).domain([0, maxValue]);
  return (
    <svg style={{ overflow: 'visible' }} height={height + 20} width={60}>
      <LinearVerticalAxis
        x={20}
        y={0}
        scale={scale}
        height={height}
        showGrid
        width={width - margin.right}
      />
    </svg>
  );
}
