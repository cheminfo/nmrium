import { useMemo } from 'react';

import { isSpectrum1D } from '../../data/data1d/Spectrum1D';
import { useChartData } from '../context/ChartContext';
import { useActiveSpectrum } from '../reducer/Reducer';

import Integral from './Integral';

function IntegralsSeries() {
  const {
    xDomains,
    data,
    displayerKey,
    view: {
      spectra: { activeTab: nucleus },
    },
  } = useChartData();
  const activeSpectrum = useActiveSpectrum();
  const Integrals = useMemo(() => {
    const isActive = (id) => {
      return activeSpectrum === null ? true : id === activeSpectrum.id;
    };

    return (
      <g className="integrals">
        {data?.[0] &&
          data
            .filter((d) => d.display.isVisible && xDomains[d.id])
            .filter(isSpectrum1D)
            .map((spectrum) =>
              spectrum.integrals.values.map((integral) => (
                <Integral
                  nucleus={nucleus}
                  key={integral.id}
                  integral={integral}
                  isActive={isActive(spectrum.id)}
                />
              )),
            )}
      </g>
    );
  }, [activeSpectrum, data, nucleus, xDomains]);

  return <g clipPath={`url(#${displayerKey}clip-chart-1d)`}>{Integrals}</g>;
}

export default IntegralsSeries;
