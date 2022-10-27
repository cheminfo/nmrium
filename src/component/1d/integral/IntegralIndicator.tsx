import { CSSProperties } from 'react';

import { useChartData } from '../../context/ChartContext';
import { formatNumber } from '../../utility/formatNumber';

interface IntegralIndicatorProps {
  value: number | undefined;
  format: string;
  width: number;
  lineColor?: string;
}

const styles: Record<'text' | 'path', CSSProperties> = {
  text: {
    fontSize: '11px',
    textAnchor: 'middle',
    dominantBaseline: 'middle',
    writingMode: 'vertical-rl',
    fill: 'black',
  },
  path: {
    fill: 'none',
    strokeWidth: '1px',
    shapeRendering: 'crispEdges',
  },
};

export function IntegralIndicator(props: IntegralIndicatorProps) {
  const { value, width, format, lineColor = 'black' } = props;
  const { height, margin } = useChartData();

  const bottom = height - margin.bottom;

  return (
    <g style={{ transform: `translate(0,${bottom - 10}px) ` }}>
      <text
        style={{
          ...styles.text,
          transform: `translate(${width / 2}px,-12px) scale(-1)`,
        }}
      >
        {value ? formatNumber(value, format) : ''}
      </text>
      <path
        style={{ ...styles.path, stroke: lineColor }}
        d={`M0 0 L0 5 L${width} 5 L${width} 0 `}
      />
    </g>
  );
}
