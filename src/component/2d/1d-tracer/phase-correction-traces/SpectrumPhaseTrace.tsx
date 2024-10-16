import type { Spectrum1D, Spectrum2D } from 'nmr-load-save';
import { Filters } from 'nmr-processing';
import type { ReactNode } from 'react';

import { getSlice } from '../../../../data/data2d/Spectrum2D/index.js';
import { useChartData } from '../../../context/ChartContext.js';
import { useActiveSpectrum } from '../../../hooks/useActiveSpectrum.js';
import useSpectrum from '../../../hooks/useSpectrum.js';
import type { TraceDirection } from '../../../reducer/Reducer.js';
import { PathBuilder } from '../../../utility/PathBuilder.js';
import {
  get2DXScale,
  get2DYScale,
  getSliceYScale,
  useScale2DX,
  useScale2DY,
} from '../../utilities/scale.js';

import { useActivePhaseTraces } from './useActivePhaseTraces.js';

interface BaseComponentProps extends React.SVGAttributes<SVGGElement> {
  children?: ReactNode;
}

interface InnerSpectrumPhaseTraceProps extends BaseComponentProps {
  data: { x: Float64Array; re: Float64Array };
}
interface SpectrumPhaseTraceProps extends BaseComponentProps {
  positionUnit: 'PPM' | 'Pixel';
  position: { x: number; y: number };
}
function usePath(x: Float64Array, y: Float64Array, direction: TraceDirection) {
  const { width, margin, height, xDomain, yDomain, mode } = useChartData();
  const { scaleRatio } = useActivePhaseTraces();
  const spectrum = useSpectrum() as Spectrum2D;

  if (!spectrum) return '';

  if (direction === 'horizontal') {
    const scaleX = get2DXScale({ margin, width, xDomain, mode });
    const scaleY = getSliceYScale(spectrum.data, height, 'RTL', {
      margin: margin.top + margin.bottom,
      scaleRatio,
    });

    const pathBuilder = new PathBuilder();
    pathBuilder.moveTo(scaleX(x[0]), scaleY(y[0]));
    for (let i = 1; i < x.length; i++) {
      pathBuilder.lineTo(scaleX(x[i]), scaleY(y[i]));
    }

    return pathBuilder.toString();
  }

  const scaleX = get2DYScale({ margin, height, yDomain });
  const scaleY = getSliceYScale(spectrum.data, width, 'RTL', {
    margin: margin.left + margin.right,
    scaleRatio,
  });

  const pathBuilder = new PathBuilder();

  pathBuilder.moveTo(scaleY(y.at(-1) as number), scaleX(x.at(-1) as number));

  for (let i = x.length - 2; i >= 0; i--) {
    pathBuilder.lineTo(scaleY(y[i]), scaleX(x[i]));
  }

  return pathBuilder.toString();
}

export function SpectrumPhaseTrace(props: SpectrumPhaseTraceProps) {
  const { positionUnit, position, children, ...otherProps } = props;
  const { tempData, width, margin, height } = useChartData();
  const { activeTraceDirection: direction } = useActivePhaseTraces();

  const scale2dX = useScale2DX();
  const scale2dY = useScale2DY();

  const activeSpectrum = useActiveSpectrum();
  if (!activeSpectrum?.id) {
    return null;
  }

  const spectrumBeforePhasing = tempData[activeSpectrum.index] as Spectrum2D;
  let positionInPixel;
  let positionInPPM;

  if (positionUnit === 'Pixel') {
    positionInPixel = position;
    positionInPPM = {
      x: scale2dX.invert(position.x),
      y: scale2dY.invert(position.y),
    };
  } else {
    positionInPixel = {
      x: scale2dX(position.x),
      y: scale2dY(position.y),
    };

    positionInPPM = position;
  }

  const sliceData = getSlice(spectrumBeforePhasing, positionInPPM, {
    sliceType: 'both',
  });

  const data = sliceData?.[direction]?.data;
  if (!data) {
    return null;
  }

  const innerHeight = height - margin.top - margin.bottom;
  const innerWidth = width - margin.left - margin.right;

  const translateY =
    direction === 'horizontal' ? positionInPixel.y - innerHeight : 0;
  const translateX =
    direction === 'vertical' ? positionInPixel.x - innerWidth : 0;

  return (
    <InnerSpectrumPhaseTrace
      transform={`translate(${translateX} ${translateY})`}
      {...otherProps}
      data={data}
    >
      {children}
    </InnerSpectrumPhaseTrace>
  );
}

function InnerSpectrumPhaseTrace(props: InnerSpectrumPhaseTraceProps) {
  const { data: dataBeforePhasing, children, ...othersProps } = props;
  const {
    color,
    activeTraceDirection: direction,
    ph0,
    ph1,
  } = useActivePhaseTraces();

  const spectrum = {
    data: dataBeforePhasing,
    info: { isComplex: true, isFid: false },
  };

  Filters.phaseCorrection.apply(spectrum as unknown as Spectrum1D, {
    ph0,
    ph1,
  });

  const { x, re } = spectrum.data;
  const path = usePath(x, re, direction);

  return (
    <g {...othersProps}>
      <path
        className="line"
        stroke={color}
        strokeWidth="1"
        fill="transparent"
        d={path}
        pointerEvents="none"
      />
      {children}
    </g>
  );
}
