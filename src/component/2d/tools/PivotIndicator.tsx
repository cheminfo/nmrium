import type { CSSProperties } from 'react';

import { useChartData } from '../../context/ChartContext.js';
import { useIndicatorLineColor } from '../../hooks/useIndicatorLineColor.js';
import type { TraceDirection } from '../../reducer/Reducer.js';
import { options } from '../../toolbar/ToolTypes.js';
import { useActivePhaseTraces } from '../1d-tracer/phase-correction-traces/useActivePhaseTraces.js';
import { get2DXScale, get2DYScale } from '../utilities/scale.js';

function getStyle(
  direction: TraceDirection,
  translate: number,
  indicatorColor: string,
) {
  const base: CSSProperties = {
    transformOrigin: 'top left',
    position: 'absolute',
    top: '0px',
    left: '0px',
    backgroundColor: indicatorColor,
    zIndex: 9,
  };
  if (direction === 'horizontal') {
    return {
      ...base,
      width: '2px',
      height: '100%',
      transform: `translateX(${translate}px) translateX(-50%)`,
    };
  }

  return {
    ...base,
    width: '100%',
    height: '2px',
    transform: `translateY(${translate}px) translateY(-50%)`,
  };
}

export function PivotIndicator() {
  const { pivot, activeTraceDirection } = useActivePhaseTraces();
  const {
    toolOptions: { selectedTool },
    width,
    height,
    margin,
    yDomain,
    xDomain,
    mode,
  } = useChartData();

  const indicatorColor = useIndicatorLineColor();

  if (options.phaseCorrectionTwoDimensions.id !== selectedTool || !pivot) {
    return null;
  }

  let translate = 0;

  if (activeTraceDirection === 'horizontal') {
    const scale = get2DXScale({ width, margin, xDomain, mode });
    translate = scale(pivot.value);
  }

  if (activeTraceDirection === 'vertical') {
    const scale = get2DYScale({ height, margin, yDomain });
    translate = scale(pivot.value);
  }
  return (
    <div style={getStyle(activeTraceDirection, translate, indicatorColor)} />
  );
}
