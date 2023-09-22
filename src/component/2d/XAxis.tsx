/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import * as d3 from 'd3';
import { Spectrum2D } from 'nmr-load-save';
import { useEffect, useRef, memo } from 'react';

import { useChartData } from '../context/ChartContext';
import useSpectrum from '../hooks/useSpectrum';

import { useScale2DX } from './utilities/scale';

const axisStyles = css`
  user-select: none;

  path,
  line {
    fill: none;
    stroke: black;
    stroke-width: 1;
    shape-rendering: crispedges;
    user-select: none;
  }
`;

const defaultMargin = { right: 100, top: 0, left: 0, bottom: 0 };

interface XAxisProps {
  show?: boolean;
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

function XAxis(props: XAxisProps) {
  const { show = true, margin: marginProps = defaultMargin } = props;

  const { height, width, margin } = useChartData();
  const spectrum = useSpectrum() as Spectrum2D;
  const scaleX = useScale2DX();

  const refAxis = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!show) return;

    const xAxis = d3.axisBottom(scaleX).ticks(8).tickFormat(d3.format('0'));

    // @ts-expect-error actually well typed
    d3.select(refAxis.current).call(xAxis);
  }, [height, margin, scaleX, show, spectrum, width]);

  if (!width || !height) {
    return null;
  }

  return (
    <>
      {show && (
        <g
          className="x"
          css={axisStyles}
          transform={`translate(0,${
            height - (margin.bottom + marginProps.bottom)
          })`}
          ref={refAxis}
        >
          <text fill="#000" x={width - 60} y="20" dy="0.71em" textAnchor="end">
            {spectrum?.info?.isFid ? 'Time [sec]' : 'δ [ppm]'}
          </text>
        </g>
      )}
    </>
  );
}

export default memo(XAxis);
