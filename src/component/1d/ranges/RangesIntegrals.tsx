import { xyIntegral, xyMaxY } from 'ml-spectra-processing';
import { Spectrum1D } from 'nmr-load-save';

import { useChartData } from '../../context/ChartContext';
import { useActiveSpectrumRangesViewState } from '../../hooks/useActiveSpectrumRangesViewState';
import useIntegralPath from '../../hooks/useIntegralPath';
import useSpectrum from '../../hooks/useSpectrum';

interface IntegralData {
  x: Float64Array;
  y: Float64Array;
  // eslint-disable-next-line react/no-unused-prop-types
  id: string;
}

interface IntegralProps extends IntegralData {
  max: number;
}

function Integral(props: IntegralProps) {
  const { x, y, max } = props;
  const { integralsScaleRatio } = useActiveSpectrumRangesViewState();
  const path = useIntegralPath({ x, y, max, scaleRatio: integralsScaleRatio });

  return (
    <path
      className="line"
      stroke="black"
      strokeWidth="1"
      fill="none"
      d={path}
    />
  );
}

const emptyData = { ranges: {}, info: {}, display: {} };

function RangesIntegrals() {
  const { displayerKey } = useChartData();
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
    <g clipPath={`url(#${displayerKey}clip-chart-1d)`}>
      {integrals.values.map((integral) => {
        return <Integral key={integral.id} {...integral} max={integrals.max} />;
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
    const integral = xyIntegral(
      { x, y: re },
      {
        from,
        to,
        reverse: true,
      },
    );
    values.push({ ...integral, id } as IntegralData);
    const value = xyMaxY(integral);
    if (value > max) max = value;
  }

  return { max, values };
}

export default RangesIntegrals;
