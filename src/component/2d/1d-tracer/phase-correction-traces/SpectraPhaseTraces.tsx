/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { useChartData } from '../../../context/ChartContext';
import { HighlightEventSource, useHighlight } from '../../../highlight';
import { SpectrumTrace, TraceDirection } from '../../../reducer/Reducer';
import { useScale2DX, useScale2DY } from '../../utilities/scale';

import { SpectrumPhaseTrace } from './SpectrumPhaseTrace';
import { useActivePhaseTraces } from './useActivePhaseTraces';

const BOX_SIZE = 20;

const style = css`
  .target {
    fill: transparent;
  }

  &:hover {
    .target {
      fill: #ff6f0057;
    }
  }
`;

export function SpectraPhaseTraces() {
  const { width, height } = useChartData();
  const { spectra = [], color, activeTraceDirection } = useActivePhaseTraces();

  if (!width || !height || spectra.length === 0) {
    return null;
  }

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
    spectrum: { data, x, y, id },
    color,
    direction,
  } = props;
  const highligh = useHighlight([id], {
    type: HighlightEventSource.PHASE_CORRECTION_TRACE,
    extra: { id },
  });

  const scale2dX = useScale2DX();
  const scale2dY = useScale2DY();

  const innerheight = height - margin.top - margin.bottom;
  const innerWidth = width - margin.left - margin.right;
  const transformY = innerheight - BOX_SIZE / 2;
  const transformX = innerWidth - BOX_SIZE / 2;

  return (
    <SpectrumPhaseTrace
      data={data}
      position={{ x: scale2dX(x), y: scale2dY(y) }}
      color={color}
      direction={direction}
      {...highligh.onHover}
      css={style}
    >
      {direction === 'horizontal' && (
        <rect
          className="target"
          y={transformY}
          x={margin.left}
          width={`${innerWidth}px`}
          height={`${BOX_SIZE}px`}
        />
      )}
      {direction === 'vertical' && (
        <rect
          className="target"
          y={margin.top}
          x={transformX}
          width={`${BOX_SIZE}px`}
          height={innerheight}
        />
      )}
    </SpectrumPhaseTrace>
  );
}
