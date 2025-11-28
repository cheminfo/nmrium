import { useChartData } from '../../../context/ChartContext.js';
import { useActiveSpectrum } from '../../../hooks/useActiveSpectrum.js';

import { PhaseTraceWithMouse } from './PhaseTraceWithMouse.js';
import { SpectraPhaseTraces } from './SpectraPhaseTraces.js';

export function PhaseTraces() {
  const { width, height, margin, displayerKey } = useChartData();
  const activeSpectrum = useActiveSpectrum();

  if (!activeSpectrum || !width || !height) return null;

  const clipWidth = width - margin.left - margin.right;
  const clipHeight = height - margin.top - margin.bottom;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      style={{
        position: 'absolute',
        zIndex: 9,
      }}
    >
      <defs>
        <clipPath id={`${displayerKey}-clip-phase-traces`}>
          <rect
            width={clipWidth}
            height={clipHeight}
            x={margin.left}
            y={margin.top}
          />
        </clipPath>
      </defs>
      <g clipPath={`url(#${displayerKey}-clip-phase-traces)`}>
        <PhaseTraceWithMouse />
        <SpectraPhaseTraces />
      </g>
    </svg>
  );
}
