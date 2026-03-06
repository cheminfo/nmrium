import type { AxisUnit } from '@zakodium/nmrium-core';
import { memo, useRef } from 'react';
import { useLinearPrimaryTicks } from 'react-d3-utils';

import { useIsInset } from '../1d/inset/InsetProvider.tsx';
import { useChartData } from '../context/ChartContext.js';
import { D3Axis } from '../elements/D3Axis.js';
import { useActiveNucleusTab } from '../hooks/useActiveNucleusTab.js';
import { useTextMetrics } from '../hooks/useTextMetrics.js';
import { useCheckExportStatus } from '../hooks/useViewportSize.tsx';
import { axisUnitToLabel } from '../hooks/use_axis_unit.ts';
import { useGridline2DConfig } from '../hooks/use_gridlines_config.ts';

import { useScale2DY } from './utilities/scale.js';

const defaultMargin = { right: 50, top: 0, bottom: 0, left: 0 };

interface IndirectAxis2DProps {
  margin?: {
    right: number;
    top: number;
    bottom: number;
    left: number;
  };
}

function IndirectAxis2D(props: IndirectAxis2DProps) {
  const { margin: marginProps = defaultMargin } = props;

  const { getTextWidth } = useTextMetrics({ labelSize: 10 });
  const { width, height, margin } = useChartData();

  const nucleus = useActiveNucleusTab();
  const [, maybeNucleusUnit] = nucleus.split(',');
  const chartUnit: AxisUnit | undefined = /^[0-9]+[A-Z][a-z]?$/.test(
    maybeNucleusUnit,
  )
    ? 'ppm'
    : undefined;
  const unitToDisplay = chartUnit;

  const scaleY = useScale2DY();
  const isInset = useIsInset();
  const isExportingProcessStart = useCheckExportStatus();

  const refAxis = useRef<SVGGElement>(null);

  const { ticks, scale: ticksScale } = useLinearPrimaryTicks(
    scaleY,
    'vertical',
    refAxis,
  );
  const gridConfig = useGridline2DConfig();

  if (!width || !height) {
    return null;
  }

  const label = unitToDisplay
    ? axisUnitToLabel[unitToDisplay]
    : maybeNucleusUnit;
  const labelHeight = getTextWidth(label);

  return (
    <D3Axis
      ref={refAxis}
      transform={`translate(${width - marginProps.right})`}
      scale={ticksScale}
      axisPosition="right"
      gridSize={width - margin.left - margin.right}
      ticks={ticks}
      showGrid={!isExportingProcessStart && !isInset}
      showPrimaryGrid={gridConfig.primary.enabled}
      showSecondaryGrid={gridConfig.secondary.enabled}
      primaryGridProps={gridConfig.primary.lineStyle}
      secondaryGridProps={gridConfig.secondary.lineStyle}
    >
      <g transform={`translate(${marginProps.right - 20}, ${margin.top})`}>
        <rect
          fill="white"
          rx={5}
          ry={5}
          width={20}
          height={labelHeight + 10}
          x={-10}
          y={-5}
          opacity={0.8}
        />
        <text
          fill="#000"
          transform="rotate(-90)"
          dominantBaseline="middle"
          textAnchor="end"
        >
          {label}
        </text>
      </g>
    </D3Axis>
  );
}

export default memo(IndirectAxis2D);
