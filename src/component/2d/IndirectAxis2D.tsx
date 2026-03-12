import { memo, useRef } from 'react';
import { useLinearPrimaryTicks } from 'react-d3-utils';

import { useIsInset } from '../1d/inset/InsetProvider.tsx';
import { AxisUnitPicker } from '../1d-2d/components/axis_unit_picker.tsx';
import { useChartData } from '../context/ChartContext.js';
import { D3Axis } from '../elements/D3Axis.js';
import { useActiveNucleusTab } from '../hooks/useActiveNucleusTab.js';
import { useTextMetrics } from '../hooks/useTextMetrics.js';
import { useCheckExportStatus } from '../hooks/useViewportSize.tsx';
import {
  axisUnitToLabel,
  useIndirectAxisUnit,
} from '../hooks/use_axis_unit.ts';
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

  const { width, height, margin } = useChartData();

  const nucleus = useActiveNucleusTab();
  const [, maybeNucleusUnit] = nucleus.split(',');
  const axis = useIndirectAxisUnit();

  const matchNucleus = /^[0-9]+[A-Z][a-z]?$/.test(maybeNucleusUnit);

  // TODO apply `axis.unit` conversion
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
        <Unit
          axis={axis}
          matchNucleus={matchNucleus}
          maybeNucleusUnit={maybeNucleusUnit}
        />
      </g>
    </D3Axis>
  );
}

interface UnitProps {
  matchNucleus: boolean;
  maybeNucleusUnit: string;
  axis: ReturnType<typeof useIndirectAxisUnit>;
}
function Unit(props: UnitProps) {
  const { axis, matchNucleus, maybeNucleusUnit } = props;

  if (!matchNucleus) return <UnitLabel>{maybeNucleusUnit}</UnitLabel>;
  if (!axis) return <UnitLabel>{axisUnitToLabel.ppm}</UnitLabel>;

  const { unit, setUnit, allowedUnits } = axis;
  const label = axisUnitToLabel[unit];

  return (
    <AxisUnitPicker unit={unit} allowedUnits={allowedUnits} onChange={setUnit}>
      <UnitLabel>{label}</UnitLabel>
    </AxisUnitPicker>
  );
}

interface UnitLabelProps {
  children: string;
}
function UnitLabel(props: UnitLabelProps) {
  const { children } = props;

  const { getTextWidth } = useTextMetrics({ labelSize: 10 });
  const labelHeight = getTextWidth(children);

  return (
    <>
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
        {children}
      </text>
    </>
  );
}

export default memo(IndirectAxis2D);
