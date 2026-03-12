import { useMemo, useRef } from 'react';
import { useLinearPrimaryTicks } from 'react-d3-utils';

import { AxisUnitPicker } from '../1d-2d/components/axis_unit_picker.tsx';
import { useChartData } from '../context/ChartContext.js';
import { useScaleChecked } from '../context/ScaleContext.js';
import { D3Axis } from '../elements/D3Axis.js';
import { useCheckExportStatus } from '../hooks/useViewportSize.js';
import {
  axisUnitToLabel,
  useHorizontalAxisUnit,
} from '../hooks/use_axis_unit.ts';
import { useGridline1DConfig } from '../hooks/use_gridlines_config.ts';

import { useIsInset } from './inset/InsetProvider.js';

export function HorizontalAxis1D() {
  const { height, width, margin } = useChartData();
  const { scaleX } = useScaleChecked();
  const isInset = useIsInset();
  const isExportingProcessStart = useCheckExportStatus();

  const { unit, allowedUnits } = useHorizontalAxisUnit();
  const unitLabel = axisUnitToLabel[unit];

  const refAxis = useRef<SVGGElement>(null);

  const scaler = useMemo(() => {
    // TODO apply unit conversion
    return scaleX(null);
  }, [scaleX]);
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
        <AxisUnitPicker
          unit={unit}
          allowedUnits={allowedUnits}
          onChange={(unit) => void unit}
        >
          <text fill="#000" x={width - 10} y="30" dy="0.70em" textAnchor="end">
            {unitLabel}
          </text>
        </AxisUnitPicker>
      )}
    </D3Axis>
  );
}
