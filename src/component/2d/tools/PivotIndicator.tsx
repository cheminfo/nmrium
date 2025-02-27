import type { CSSProperties } from 'react';

import { useChartData } from '../../context/ChartContext.js';
import type { TraceDirection } from '../../reducer/Reducer.js';
import { options } from '../../toolbar/ToolTypes.js';
import { useActivePhaseTraces } from '../1d-tracer/phase-correction-traces/useActivePhaseTraces.js';
import { get2DXScale, get2DYScale } from '../utilities/scale.js';

function getStyle(direction: TraceDirection, translate: number) {
  const base: CSSProperties = {
    transformOrigin: 'top left',
    position: 'absolute',
    top: '0px',
    left: '0px',
    backgroundColor: 'yellow',
    zIndex: 9,
  };
  if (direction === 'horizontal') {
    return {
      ...base,
      width: '1px',
      height: '100%',
      transform: `translateX(${translate}px)`,
    };
  }

  return {
    ...base,
    width: '100%',
    height: '1px',
    transform: `translateY(${translate}px)`,
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
  return <div style={getStyle(activeTraceDirection, translate)} />;
}
