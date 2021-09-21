import { useMemo } from 'react';

import { isSpectrum1D } from '../../data/data1d/Spectrum1D';
import { useChartData } from '../context/ChartContext';

import Integral from './Integral';

function IntegralsSeries() {
  const { xDomains, activeSpectrum, data, displayerKey } = useChartData();

  const Integrals = useMemo(() => {
    const isActive = (id) => {
      return activeSpectrum === null
        ? true
        : id === activeSpectrum.id
        ? true
        : false;
    };

    return (
      <g className="integrals">
        {data?.[0] &&
          data
            .filter((d) => d.display.isVisible === true && xDomains[d.id])
            .filter(isSpectrum1D)
            .map((spectrum) =>
              spectrum.integrals.values.map((integral) => (
                <Integral
                  key={integral.id}
                  integral={integral}
                  spectrum={spectrum}
                  isActive={isActive(spectrum.id)}
                />
              )),
            )}
      </g>
    );
  }, [activeSpectrum, data, xDomains]);

  return <g clipPath={`url(#${displayerKey}clip-chart-1d)`}>{Integrals}</g>;
}

export default IntegralsSeries;
