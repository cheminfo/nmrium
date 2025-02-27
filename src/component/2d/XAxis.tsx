import type { Spectrum2D } from 'nmr-load-save';
import { memo, useRef } from 'react';
import { useLinearPrimaryTicks } from 'react-d3-utils';

import { useChartData } from '../context/ChartContext.js';
import { D3Axis } from '../elements/D3Axis.js';
import useSpectrum from '../hooks/useSpectrum.js';

import { useScale2DX } from './utilities/scale.js';

const defaultMargin = { right: 100, top: 0, left: 0, bottom: 0 };

interface XAxisProps {
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

function XAxis(props: XAxisProps) {
  const { margin: marginProps = defaultMargin } = props;

  const { height, width, margin } = useChartData();
  const spectrum = useSpectrum() as Spectrum2D;
  const scaleX = useScale2DX();

  const refAxis = useRef<SVGGElement>(null);

  const { ticks, scale: ticksScale } = useLinearPrimaryTicks(
    scaleX,
    'horizontal',
    refAxis,
  );

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
      ticks={ticks}
    >
      <text fill="#000" x={width - 60} y="20" dy="0.71em" textAnchor="end">
        {spectrum?.info?.isFid ? 'Time [sec]' : 'δ [ppm]'}
      </text>
    </D3Axis>
  );
}

export default memo(XAxis);
