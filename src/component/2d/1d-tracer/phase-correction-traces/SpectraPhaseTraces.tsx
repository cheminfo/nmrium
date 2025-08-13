import styled from '@emotion/styled';

import { useChartData } from '../../../context/ChartContext.js';
import {
  HighlightEventSource,
  useHighlight,
} from '../../../highlight/index.js';
import type {
  SpectrumTrace,
  TraceDirection,
} from '../../../reducer/Reducer.js';

import { SpectrumPhaseTrace } from './SpectrumPhaseTrace.js';
import { useActivePhaseTraces } from './useActivePhaseTraces.js';

const BOX_SIZE = 20;

const Rect = styled.rect`
  fill: transparent;

  :hover {
    fill: #ff6f0057;
  }
`;

export function SpectraPhaseTraces() {
  const { spectra = [], color, activeTraceDirection } = useActivePhaseTraces();

  return spectra.map((spectrumTrace) => {
    return (
      <PhaseTrace
        key={spectrumTrace.id}
        spectrum={spectrumTrace}
        color={color}
        direction={activeTraceDirection}
      />
    );
  });
}

interface SpectrumTraceProps {
  spectrum: SpectrumTrace;
  color: string;
  direction: TraceDirection;
}

function PhaseTrace(props: SpectrumTraceProps) {
  const { width, height, margin } = useChartData();

  const {
    spectrum: { x, y, id },
    direction,
  } = props;
  const highlight = useHighlight([id], {
    type: HighlightEventSource.PHASE_CORRECTION_TRACE,
    extra: { id },
  });

  const innerHeight = height - margin.top - margin.bottom;
  const innerWidth = width - margin.left - margin.right;
  const transformY = innerHeight - BOX_SIZE / 2;
  const transformX = innerWidth - BOX_SIZE / 2;

  return (
    <SpectrumPhaseTrace
      positionUnit="PPM"
      position={{ x, y }}
      {...highlight.onHover}
    >
      {direction === 'horizontal' && (
        <Rect
          y={transformY}
          x={margin.left}
          width={`${innerWidth}px`}
          height={`${BOX_SIZE}px`}
        />
      )}
      {direction === 'vertical' && (
        <Rect
          y={margin.top}
          x={transformX}
          width={`${BOX_SIZE}px`}
          height={innerHeight}
        />
      )}
    </SpectrumPhaseTrace>
  );
}
