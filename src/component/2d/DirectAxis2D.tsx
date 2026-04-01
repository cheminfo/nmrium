import { memo, useRef } from 'react';
import { useLinearPrimaryTicks } from 'react-d3-utils';

import { useIsInset } from '../1d/inset/InsetProvider.tsx';
import { AxisUnitPicker } from '../1d-2d/components/axis_unit_picker.tsx';
import { useChartData } from '../context/ChartContext.js';
import { D3Axis } from '../elements/D3Axis.js';
import { useCheckExportStatus } from '../hooks/useViewportSize.tsx';
import { axisUnitToLabel, useDirectAxisUnit } from '../hooks/use_axis_unit.ts';
import { useGridline2DConfig } from '../hooks/use_gridlines_config.ts';

import { useScale2DX } from './utilities/scale.js';

const defaultMargin = { right: 100, top: 0, left: 0, bottom: 0 };

interface DirectAxis2DProps {
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

function DirectAxis2D(props: DirectAxis2DProps) {
  const { margin: marginProps = defaultMargin } = props;

  const { height, width, margin } = useChartData();

  const axis = useDirectAxisUnit();
  const scaleX = useScale2DX({ customDomain: axis?.domain });
  const isInset = useIsInset();
  const isExportingProcessStart = useCheckExportStatus();

  const refAxis = useRef<SVGGElement>(null);

  const { ticks, scale: ticksScale } = useLinearPrimaryTicks(
    scaleX,
    'horizontal',
    refAxis,
  );
  const gridConfig = useGridline2DConfig();

  if (!width || !height) {
    return null;
  }

  return (
    <D3Axis
      ref={refAxis}
      transform={`translate(0,${
        height - (margin.bottom + marginProps.bottom)
      })`}
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
      <Unit width={width - 60} axis={axis} />
    </D3Axis>
  );
}

interface UnitProps {
  width: number;
  axis: ReturnType<typeof useDirectAxisUnit>;
}
function Unit(props: UnitProps) {
  const { width, axis } = props;

  if (!axis) {
    return <UnitLabel width={width}>{axisUnitToLabel.ppm}</UnitLabel>;
  }

  const { unit, allowedUnits, setUnit } = axis;
  const label = axisUnitToLabel[unit];

  return (
    <AxisUnitPicker unit={unit} allowedUnits={allowedUnits} onChange={setUnit}>
      <UnitLabel width={width}>{label}</UnitLabel>
    </AxisUnitPicker>
  );
}

interface UnitLabelProps {
  width: number;
  children: string;
}
function UnitLabel(props: UnitLabelProps) {
  const { width, children } = props;

  return (
    <text fill="#000" x={width - 60} y="20" dy="0.71em" textAnchor="end">
      {children}
    </text>
  );
}

export default memo(DirectAxis2D);
