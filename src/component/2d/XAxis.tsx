/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import * as d3 from 'd3';
import { ScaleLinear } from 'd3';
import { useEffect, useRef, memo } from 'react';

import { Datum2D } from '../../data/types/data2d';
import { useChartData } from '../context/ChartContext';
import useSpectrum from '../hooks/useSpectrum';

import { get2DXScale } from './utilities/scale';

const axisStyles = css`
  user-select: none;

  path,
  line {
    fill: none;
    stroke: black;
    stroke-width: 1;
    shape-rendering: crispEdges;
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

  const { xDomain, height, width, margin } = useChartData();
  const spectrum = useSpectrum() as Datum2D;

  const refAxis = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!show) return;

    let scaleX: ScaleLinear<number, number, never> | null = null;

    if (spectrum?.info.isFid) {
      const { minX, maxX } = spectrum.data;
      scaleX = get2DXScale(
        {
          width,
          margin,
          xDomain: [minX, maxX],
        },
        true,
      );
    } else {
      scaleX = get2DXScale({
        width,
        margin,
        xDomain,
      });
    }

    const xAxis = d3.axisBottom(scaleX).ticks(8).tickFormat(d3.format('0'));

    // @ts-expect-error actually well typed
    d3.select(refAxis.current).call(xAxis);
  }, [height, margin, show, spectrum, width, xDomain]);

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
