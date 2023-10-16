import { xyIntegral, xyMaxY } from 'ml-spectra-processing';
import { Spectrum1D } from 'nmr-load-save';
import { Integral as IntegralType } from 'nmr-processing';

import { useChartData } from '../../context/ChartContext';
import useSpectrum from '../../hooks/useSpectrum';

import { Integration } from './Integration';

const emptyData = { integrals: {}, info: {}, display: {} };

export interface IntegralData extends IntegralType {
  x: Float64Array;
  y: Float64Array;
}

export default function IntegralsSeries() {
  const {
    displayerKey,
    view: {
      spectra: { activeTab: nucleus },
    },
  } = useChartData();
  const integrals = useIntegrals();

  if (!integrals) return null;

  return (
    <g clipPath={`url(#${displayerKey}clip-chart-1d)`} className="integrals">
      {integrals.values.map((integral) => (
        <Integration
          nucleus={nucleus}
          key={integral.id}
          integral={integral}
          max={integrals.max}
        />
      ))}
    </g>
  );
}

function useIntegrals() {
  const spectrum = useSpectrum(emptyData) as Spectrum1D;

  if (
    !spectrum.integrals?.values ||
    !spectrum.display.isVisible ||
    spectrum.info?.isFid
  ) {
    return null;
  }

  let max = Number.NEGATIVE_INFINITY;
  const values: IntegralData[] = [];

  const {
    data: { x, re },
    integrals,
  } = spectrum;
  for (const integral of integrals?.values || []) {
    const { from, to } = integral;
    const integralData = xyIntegral(
      { x, y: re },
      {
        from,
        to,
        reverse: true,
      },
    );
    values.push({ ...integral, ...integralData } as IntegralData);
    const value = xyMaxY(integralData);
    if (value > max) max = value;
  }

  return { max, values };
}
