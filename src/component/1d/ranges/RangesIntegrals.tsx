import type { Spectrum1D } from '@zakodium/nmrium-core';
import { xyIntegral, xyMaxY } from 'ml-spectra-processing';

import { getOpacityBasedOnSignalKind } from '../../../data/utilities/RangeUtilities.js';
import { useChartData } from '../../context/ChartContext.js';
import { useActiveSpectrumRangesViewState } from '../../hooks/useActiveSpectrumRangesViewState.js';
import useIntegralPath from '../../hooks/useIntegralPath.js';
import useSpectrum from '../../hooks/useSpectrum.js';

interface IntegralData {
  id: string;
  x: Float64Array;
  y: Float64Array;
  opacity: number;
}

interface IntegralProps extends Omit<IntegralData, 'id'> {
  from: number;
  to: number;
  max: number;
}

function Integral(props: IntegralProps) {
  const { x, y, max, from, to, opacity } = props;
  const { integralsScaleRatio } = useActiveSpectrumRangesViewState();
  const path = useIntegralPath({
    x,
    y,
    max,
    scaleRatio: integralsScaleRatio,
    from,
    to,
  });

  return (
    <path
      className="line"
      stroke="black"
      strokeWidth="1"
      fill="none"
      opacity={opacity}
      d={path}
    />
  );
}

const emptyData = { ranges: {}, info: {}, display: {} };

export default function RangesIntegrals() {
  const {
    xDomain: [from, to],
  } = useChartData();
  const spectrum = useSpectrum(emptyData) as Spectrum1D;
  const integrals = useIntegrals();
  if (
    !spectrum.ranges?.values ||
    !spectrum.display.isVisible ||
    spectrum.info?.isFid ||
    !integrals
  ) {
    return null;
  }

  return (
    <g>
      {integrals.values.map((integral) => {
        return (
          <Integral
            key={integral.id}
            {...integral}
            max={integrals.max}
            {...{ from, to }}
          />
        );
      })}
    </g>
  );
}

function useIntegrals() {
  const spectrum = useSpectrum() as Spectrum1D;
  const { showIntegrals } = useActiveSpectrumRangesViewState();

  if (!spectrum || !showIntegrals) return;

  let max = -Infinity;
  const values: IntegralData[] = [];

  const {
    data: { x, re },
    ranges,
  } = spectrum;
  for (const range of ranges?.values || []) {
    const { from, to, id } = range;
    const opacity = getOpacityBasedOnSignalKind(range);
    const integral = xyIntegral(
      { x, y: re },
      {
        from,
        to,
        reverse: true,
      },
    );
    values.push({ ...integral, id, opacity });
    const value = xyMaxY(integral);
    if (value > max) max = value;
  }

  return { max, values };
}
