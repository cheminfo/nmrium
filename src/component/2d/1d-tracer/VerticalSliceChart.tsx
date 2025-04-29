import type { Spectrum2D } from '@zakodium/nmrium-core';
import type { NmrData1D } from 'cheminfo-types';

import { useChartData } from '../../context/ChartContext.js';
import useSpectrum from '../../hooks/useSpectrum.js';
import { PathBuilder } from '../../utility/PathBuilder.js';
import { getSliceYScale, useScale2DY } from '../utilities/scale.js';

interface BaseProps {
  reverse?: boolean;
  horizontalMargin?: number;
}

interface VerticalSliceChartProps extends BaseProps {
  data: NmrData1D;
}

interface usePathOptions extends BaseProps {
  width?: number;
}

function usePath(data, props: usePathOptions) {
  const { reverse, width = 100, horizontalMargin = 10 } = props;
  const { mode } = useChartData();
  const scaleX = useScale2DY(reverse);
  const spectrum = useSpectrum() as Spectrum2D;

  if (!data || !spectrum) {
    return '';
  }

  const { x, re: y } = data;

  const scaleY = getSliceYScale(spectrum.data, width, mode, {
    margin: horizontalMargin,
  });

  const pathBuilder = new PathBuilder();

  pathBuilder.moveTo(scaleY(y.at(-1)), scaleX(x.at(-1)));

  for (let i = x.length - 2; i >= 0; i--) {
    pathBuilder.lineTo(scaleY(y[i]), scaleX(x[i]));
  }
  return pathBuilder.toString();
}

function VerticalSliceChart(props: VerticalSliceChartProps) {
  const { horizontalMargin = 10, data, reverse = false } = props;
  const { height, margin, displayerKey } = useChartData();

  const width = margin.left;

  const path = usePath(data, { width, horizontalMargin, reverse });

  const innerHeight = height - margin.bottom - margin.top;

  return (
    <svg viewBox={`0 0 ${height} ${height}`} width={height} height={height}>
      <defs>
        <clipPath id={`${displayerKey}clip-left`}>
          <rect width={width} height={innerHeight} x="0" y={margin.top} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${displayerKey}clip-left)`}>
        <path className="line" stroke="red" fill="none" d={path} />
      </g>
    </svg>
  );
}

export default VerticalSliceChart;
