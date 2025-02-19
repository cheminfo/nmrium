import * as d3 from 'd3';
import type { Spectrum2D } from 'nmr-load-save';
import { memo, useEffect, useRef } from 'react';

import { useChartData } from '../context/ChartContext.js';
import { AxisGroup } from '../elements/AxisGroup.js';
import useSpectrum from '../hooks/useSpectrum.js';

import { useScale2DY } from './utilities/scale.js';

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
    <AxisGroup
      className="y"
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
    </AxisGroup>
  );
}

export default memo(YAxis);
