import type { ReactNode, SVGAttributes } from 'react';

import { useInsetOptions } from '../../1d/inset/InsetProvider.js';
import { useChartData } from '../../context/ChartContext.js';
import { usePreferences } from '../../context/PreferencesContext.js';

interface SVGRootContainerProps extends SVGAttributes<SVGSVGElement> {
  children: ReactNode;
  enableBoxBorder?: boolean;
  id?: string;
  width?: number;
  height?: number;
}

export function SVGRootContainer(props: SVGRootContainerProps) {
  const {
    children,
    enableBoxBorder = false,
    id = 'nmrSVG',
    x,
    y,
    width: externalWidth,
    height: externalHeight,
    viewBox: externalViewBox,
    ...otherProps
  } = props;

  const {
    current: {
      general: { spectraRendering },
    },
  } = usePreferences();
  const {
    width: baseWidth,
    height: baseHeight,
    margin,
    displayerKey,
  } = useChartData();
  const { id: insetKey = 'primary' } = useInsetOptions() || {};

  const width = externalWidth ?? baseWidth;
  const height = externalHeight ?? baseHeight;

  const innerWidth = baseWidth - margin.left - margin.right;
  const innerHeight = baseHeight - margin.top - margin.bottom;
  const viewBox = externalViewBox ?? `0 0 ${width} ${height}`;

  return (
    <svg
      id={id}
      x={x}
      y={y}
      width={width}
      height={height}
      viewBox={viewBox}
      fontFamily="Arial, Helvetica, sans-serif"
      shapeRendering={spectraRendering}
      style={{
        position: 'absolute',
      }}
      {...otherProps}
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
