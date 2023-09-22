/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import * as d3 from 'd3';
import { Spectrum2D } from 'nmr-load-save';
import { useEffect, useRef, memo } from 'react';

import { useChartData } from '../context/ChartContext';
import useSpectrum from '../hooks/useSpectrum';

import { useScale2DY } from './utilities/scale';

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

const defaultMargin = { right: 50, top: 0, bottom: 0, left: 0 };

interface YAxisProps {
  show?: boolean;
  label?: string;
  margin?: {
    right: number;
    top: number;
    bottom: number;
    left: number;
  };
}

function YAxis(props: YAxisProps) {
  const {
    show = true,
    label = '',
    margin: marginProps = defaultMargin,
  } = props;

  const refAxis = useRef<SVGGElement>(null);

  const { yDomain, width, height } = useChartData();
  const scaleY = useScale2DY();
  const spectrum = useSpectrum() as Spectrum2D;

  useEffect(() => {
    if (!show || !yDomain) return;

    const axis = d3.axisRight(scaleY).ticks(8).tickFormat(d3.format('0'));

    // @ts-expect-error well typed
    d3.select(refAxis.current).call(axis);
  }, [spectrum, yDomain, show, scaleY]);

  if (!width || !height) {
    return null;
  }

  return (
    <g
      className="y"
      css={axisStyles}
      transform={`translate(${width - marginProps.right})`}
      ref={refAxis}
    >
      <text
        fill="#000"
        x={-marginProps.top}
        y={-(marginProps.right - 5)}
        dy="0.71em"
        transform="rotate(-90)"
        textAnchor="end"
      >
        {label}
      </text>
    </g>
  );
}

export default memo(YAxis);
