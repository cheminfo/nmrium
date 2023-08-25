import { Spectrum1D } from 'nmr-load-save';

import { useChartData } from '../../context/ChartContext';

import Integral from './Integral';
import useSpectrum from '../../hooks/useSpectrum';

const emptyData = { integrals: {}, info: {}, display: {} };

function IntegralsSeries() {
  const {
    displayerKey,
    view: {
      spectra: { activeTab: nucleus },
    },
  } = useChartData();

  const spectrum = useSpectrum(emptyData) as Spectrum1D;

  if (
    !spectrum.integrals?.values ||
    !spectrum.display.isVisible ||
    spectrum.info?.isFid
  ) {
    return null;
  }

  return (
    <g clipPath={`url(#${displayerKey}clip-chart-1d)`}>
      <g className="integrals">
        {spectrum.integrals.values.map((integral) => (
          <Integral nucleus={nucleus} key={integral.id} integral={integral} />
        ))}
      </g>
    </g>
  );
}

export default IntegralsSeries;
