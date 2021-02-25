import { useMemo } from 'react';

import { useChartData } from '../context/ChartContext';
import { useScale } from '../context/ScaleContext';

import Integral from './Integral';
import { getIntegralYScale } from './utilities/scale';

function IntegralsSeries() {
  const {
    xDomain,
    activeSpectrum,
    data,
    height,
    margin,
    verticalAlign,
    integralsYDomains,
    displayerKey,
  } = useChartData();
  const { scaleX } = useScale();

  const scaleY = useMemo(() => {
    if (activeSpectrum && integralsYDomains[activeSpectrum.id]) {
      return getIntegralYScale(
        { height, margin, verticalAlign, integralsYDomains },
        activeSpectrum.id,
      );
    } else {
      return null;
    }
  }, [activeSpectrum, height, integralsYDomains, margin, verticalAlign]);

  const Integrals = useMemo(() => {
    const IsActive = (id) => {
      return activeSpectrum === null
        ? true
        : id === activeSpectrum.id
        ? true
        : false;
    };

    return (
      data &&
      data[0] &&
      data
        .filter(
          (d) =>
            d.display.isVisible === true &&
            d.display.isVisibleInDomain === true,
        )
        .map(
          (spectrum) =>
            spectrum.integrals &&
            spectrum.integrals.values &&
            spectrum.integrals.values.map((integral) => (
              <g key={integral.id}>
                <Integral
                  spectrumID={spectrum.id}
                  integralData={integral}
                  x={spectrum.data.x}
                  y={spectrum.data.y}
                  isActive={IsActive(spectrum.id)}
                  xDomain={xDomain}
                  scaleY={scaleY}
                  scaleX={scaleX}
                />
              </g>
            )),
        )
    );
  }, [activeSpectrum, data, scaleX, scaleY, xDomain]);

  return <g clipPath={`url(#${displayerKey}clip-chart-1d)`}>{Integrals}</g>;
}

export default IntegralsSeries;
