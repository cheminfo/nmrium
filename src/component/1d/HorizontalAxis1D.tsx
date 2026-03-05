import { useMemo, useRef } from 'react';
import { useLinearPrimaryTicks } from 'react-d3-utils';

import { useChartData } from '../context/ChartContext.js';
import { useScaleChecked } from '../context/ScaleContext.js';
import { D3Axis } from '../elements/D3Axis.js';
import { useCheckExportStatus } from '../hooks/useViewportSize.js';
import { useGridline1DConfig } from '../hooks/use_gridlines_config.ts';

import { useIsInset } from './inset/InsetProvider.js';

interface HorizontalAxis1DProps {
  label?: string;
}

export function HorizontalAxis1D(props: HorizontalAxis1DProps) {
  const { label: labelProp } = props;
  const { height, width, margin, mode } = useChartData();
  const { scaleX } = useScaleChecked();
  const isInset = useIsInset();
  const isExportingProcessStart = useCheckExportStatus();

  const label = labelProp || (mode === 'RTL' ? 'δ [ppm]' : 'time [s]');

  const refAxis = useRef<SVGGElement>(null);

  const scale = useMemo(() => scaleX(null), [scaleX]);
  const { ticks, scale: ticksScale } = useLinearPrimaryTicks(
    scale,
    'horizontal',
    refAxis,
  );
  const gridConfig = useGridline1DConfig();

  if (!width || !height) {
    return null;
  }

  return (
    <D3Axis
      ref={refAxis}
      transform={`translate(0,${height - margin.bottom})`}
      scale={ticksScale}
      axisPosition="bottom"
      gridSize={height - margin.top - margin.bottom}
      ticks={ticks}
      showGrid={!isExportingProcessStart && !isInset}
      showPrimaryGrid={gridConfig.primary.enabled}
      showSecondaryGrid={gridConfig.secondary.enabled}
      primaryGridProps={gridConfig.primary.lineStyle}
      secondaryGridProps={gridConfig.secondary.lineStyle}
    >
      {!isInset && (
        <text fill="#000" x={width - 10} y="30" dy="0.70em" textAnchor="end">
          {label}
        </text>
      )}
    </D3Axis>
  );
}
