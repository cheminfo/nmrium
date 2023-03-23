import { CSSProperties } from 'react';

import { useChartData } from '../../context/ChartContext';
import { formatNumber } from '../../utility/formatNumber';

interface IntegralIndicatorProps {
  value: number | undefined;
  format: string;
  width: number;
  opacity?: number;
}

const styles: Record<'text' | 'path', CSSProperties> = {
  text: {
    fontSize: '11px',
    fill: 'black',
  },
  path: {
    fill: 'none',
    strokeWidth: '1px',
    shapeRendering: 'crispEdges',
    stroke: 'black',
  },
};

export function IntegralIndicator(props: IntegralIndicatorProps) {
  const { value, width, format, opacity = 1 } = props;
  const { height, margin } = useChartData();

  const bottom = height - margin.bottom;

  return (
    <g transform={`translate(0 ${bottom - 10})`} style={{ opacity }}>
      <text
        transform={`rotate(-90) translate(5 ${Math.round(width / 2) + 4})`}
        style={styles.text}
      >
        {value ? formatNumber(value, format) : ''}
      </text>
      <path style={styles.path} d={`M0 0 L0 5 L${width} 5 L${width} 0 `} />
    </g>
  );
}
