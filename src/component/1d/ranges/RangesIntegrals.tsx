import type { Spectrum1D } from '@zakodium/nmrium-core';
import { xyIntegral, xyMaxY } from 'ml-spectra-processing';

import { getOpacityBasedOnSignalKind } from '../../../data/utilities/RangeUtilities.ts';
import { useChartData } from '../../context/ChartContext.js';
import { useActiveSpectrumRangesViewState } from '../../hooks/useActiveSpectrumRangesViewState.js';
import useIntegralPath from '../../hooks/useIntegralPath.js';
import useSpectrum from '../../hooks/useSpectrum.js';

interface IntegralData {
  x: Float64Array;
  y: Float64Array;
  // eslint-disable-next-line react/no-unused-prop-types
  id: string;
  from: number;
  to: number;
  opacity: number;
}

interface IntegralProps extends IntegralData {
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

function RangesIntegrals() {
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

  let max = Number.NEGATIVE_INFINITY;
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
    values.push({ ...integral, id, opacity } as IntegralData);
    const value = xyMaxY(integral);
    if (value > max) max = value;
  }

  return { max, values };
}

export default RangesIntegrals;
