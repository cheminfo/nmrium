import { memo, useMemo } from 'react';
import { SVGStyledText } from 'react-science/ui';

import { useIsInset } from '../1d/inset/InsetProvider.tsx';
import { AxisUnitPicker } from '../1d-2d/components/axis_unit_picker.tsx';
import { useChartData } from '../context/ChartContext.js';
import { D3Axis } from '../elements/D3Axis.js';
import { useActiveNucleusTab } from '../hooks/useActiveNucleusTab.js';
import { useCheckExportStatus } from '../hooks/useViewportSize.tsx';
import {
  axisUnitToLabel,
  useIndirectAxisUnit,
} from '../hooks/use_axis_unit.ts';
import { useGridline2DConfig } from '../hooks/use_gridlines_config.ts';
import { useTicksConfig } from '../hooks/use_ticks_config.ts';
import { getAxisLayout } from '../utility/getAxisLayout.ts';
import { getVerticalAxisTicks } from '../utility/getVerticalAxisTicks.ts';

import { useScale2DY } from './utilities/scale.js';

const defaultMargin = { right: 0, top: 0, bottom: 0, left: 0 };

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
  const [, maybeNucleusUnit] = nucleus.split(',', 2);
  const axis = useIndirectAxisUnit();

  const matchNucleus = /^[0-9]+[A-Z][a-z]?$/.test(maybeNucleusUnit);

  const scaleY = useScale2DY({
    customDomain: matchNucleus ? axis?.domain : undefined,
  });
  const isInset = useIsInset();
  const isExportingProcessStart = useCheckExportStatus();

  const axisStyle = useTicksConfig();
  const { tickFontSize, rightLabelInset } = getAxisLayout(axisStyle);
  const { ticks, scale: ticksScale } = useMemo(
    () => getVerticalAxisTicks(scaleY, tickFontSize),
    [scaleY, tickFontSize],
  );
  const gridConfig = useGridline2DConfig();

  if (!width || !height) {
    return null;
  }

  return (
    <D3Axis
      transform={`translate(${width - margin.right - marginProps.right})`}
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
      <g
        transform={`translate(${margin.right - rightLabelInset}, ${margin.top})`}
      >
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
  const axis = useTicksConfig();
  const { labelStyle } = axis;
  const { rightLabelText } = getAxisLayout(axis);

  return (
    <SVGStyledText fill="black" {...rightLabelText} {...labelStyle}>
      {children}
    </SVGStyledText>
  );
}

export default memo(IndirectAxis2D);
