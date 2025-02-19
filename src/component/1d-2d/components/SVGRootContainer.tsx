import type { ReactNode } from 'react';

import { useInsetOptions } from '../../1d/inset/InsetProvider.js';
import { useChartData } from '../../context/ChartContext.js';
import { usePreferences } from '../../context/PreferencesContext.js';

interface SVGRootContainerProps {
  children: ReactNode;
  enableBoxBorder?: boolean;
  id?: string;
  x?: string | number;
  y?: string | number;
}

export function SVGRootContainer(props: SVGRootContainerProps) {
  const { children, enableBoxBorder = false, id = 'nmrSVG', x, y } = props;

  const {
    current: {
      general: { spectraRendering },
    },
  } = usePreferences();
  const { width, height, margin, displayerKey } = useChartData();
  const { id: insetKey = 'primary' } = useInsetOptions() || {};

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  return (
    <svg
      id={id}
      x={x}
      y={y}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fontFamily="Arial, Helvetica, sans-serif"
      shapeRendering={spectraRendering}
      style={{
        position: 'absolute',
      }}
    >
      <defs>
        <clipPath id={`${displayerKey}clip-chart-${insetKey}`}>
          <rect
            width={innerWidth}
            height={innerHeight}
            x={margin.left}
            y={margin.top}
          />
        </clipPath>
      </defs>

      {enableBoxBorder && (
        <rect
          width={innerWidth}
          height={innerHeight}
          x={margin.left}
          y={margin.top}
          stroke="black"
          strokeWidth="1"
          fill="transparent"
        />
      )}

      {children}
    </svg>
  );
}
