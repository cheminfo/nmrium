import type { AxisUnit } from '@zakodium/nmrium-core';
import { useMemo, useRef } from 'react';
import { useLinearPrimaryTicks } from 'react-d3-utils';

import { useChartData } from '../context/ChartContext.js';
import { useScaleChecked } from '../context/ScaleContext.js';
import { D3Axis } from '../elements/D3Axis.js';
import { useCheckExportStatus } from '../hooks/useViewportSize.js';
import {
  axisUnitToLabel,
  useHorizontalAxis1DUnit,
} from '../hooks/use_axis_unit.ts';
import { useGridline1DConfig } from '../hooks/use_gridlines_config.ts';

import { useIsInset } from './inset/InsetProvider.js';

export function HorizontalAxis1D() {
  const { height, width, margin, mode } = useChartData();
  const { scaleX } = useScaleChecked();
  const isInset = useIsInset();
  const isExportingProcessStart = useCheckExportStatus();

  const workspaceUnit = useHorizontalAxis1DUnit();
  const chartUnit: AxisUnit = mode === 'RTL' ? 'ppm' : 'hz';
  const label = axisUnitToLabel[workspaceUnit];

  const refAxis = useRef<SVGGElement>(null);

  const scaler = useMemo(() => {
    // TODO scale chartUnit to workspaceUnit
    // also, should not it be spectrumUnit instead (see DirectAxis2D)
    void workspaceUnit;
    void chartUnit;
    return scaleX(null);
  }, [scaleX, chartUnit, workspaceUnit]);
  const { ticks, scale: ticksScale } = useLinearPrimaryTicks(
    scaler,
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
