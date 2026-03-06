import type { AxisUnit, Spectrum2D } from '@zakodium/nmrium-core';
import { memo, useRef } from 'react';
import { useLinearPrimaryTicks } from 'react-d3-utils';

import { useIsInset } from '../1d/inset/InsetProvider.tsx';
import { useChartData } from '../context/ChartContext.js';
import { D3Axis } from '../elements/D3Axis.js';
import useSpectrum from '../hooks/useSpectrum.js';
import { useCheckExportStatus } from '../hooks/useViewportSize.tsx';
import { axisUnitToLabel } from '../hooks/use_axis_unit.ts';
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
  const spectrum = useSpectrum() as Spectrum2D;

  const spectrumUnit: AxisUnit = spectrum?.info?.isFid ? 's' : 'ppm';
  const unitLabel = axisUnitToLabel[spectrumUnit];

  const scaleX = useScale2DX();
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
      <text fill="#000" x={width - 60} y="20" dy="0.71em" textAnchor="end">
        {unitLabel}
      </text>
    </D3Axis>
  );
}

export default memo(DirectAxis2D);
