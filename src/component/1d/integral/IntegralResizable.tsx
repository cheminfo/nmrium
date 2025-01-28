import styled from '@emotion/styled';
import type { Integral } from 'nmr-processing';

import { useChartData } from '../../context/ChartContext.js';
import { useDispatch } from '../../context/DispatchContext.js';
import { useScaleChecked } from '../../context/ScaleContext.js';
import { ResizerWithScale } from '../../elements/ResizerWithScale.js';
import { HighlightEventSource, useHighlight } from '../../highlight/index.js';
import { useResizerStatus } from '../../hooks/useResizerStatus.js';

import { IntegralIndicator } from './IntegralIndicator.js';
import useSpectrum from '../../hooks/useSpectrum.js';

const Group = styled.g<{ isActive: boolean }>`
  rect {
    fill: ${(props) => (props.isActive ? '#ff6f0057' : 'transparent')};
  }

  .target {
    visibility: ${(props) => (props.isActive ? 'visible' : 'hidden')};
  }
`;

interface IntegralResizableProps {
  integralData: Integral;
  integralFormat: string;
}

function IntegralResizable({
  integralData,
  integralFormat,
}: IntegralResizableProps) {
  const { height, margin } = useChartData();
  const spectrum = useSpectrum();

  const { scaleX } = useScaleChecked();
  const dispatch = useDispatch();
  const { id, integral, to, from } = integralData;
  const highlight = useHighlight([id], {
    type: HighlightEventSource.INTEGRAL,
    extra: { id, spectrumID: spectrum.id },
  });

  function handleOnStopResizing(position) {
    dispatch({
      type: 'RESIZE_INTEGRAL',
      payload: {
        integral: {
          ...integralData,
          from: scaleX().invert(position.x2),
          to: scaleX().invert(position.x1),
        },
        spectrumKey: spectrum.id,
      },
    });
  }

  const bottom = height - margin.bottom;

  const isResizingActive = useResizerStatus('integral');

  return (
    <g
      onMouseEnter={() => highlight.show()}
      onMouseLeave={() => highlight.hide()}
    >
      <ResizerWithScale
        from={from}
        to={to}
        onEnd={handleOnStopResizing}
        disabled={!isResizingActive}
      >
        {({ x1, x2 }, isActive) => {
          const width = x2 - x1;

          return (
            <Group isActive={highlight.isActive || isActive}>
              <rect width={width} height={bottom} data-no-export="true" />
              <IntegralIndicator
                value={integral}
                format={integralFormat}
                width={width}
              />
            </Group>
          );
        }}
      </ResizerWithScale>
    </g>
  );
}

export default IntegralResizable;
