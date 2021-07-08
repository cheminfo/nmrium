import { useCallback, useMemo } from 'react';

import { isSpectrum1D } from '../../data/data1d/Spectrum1D';
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

  const scaleY = useCallback(
    (id) => {
      if (activeSpectrum && integralsYDomains[id]) {
        return getIntegralYScale(
          { height, margin, verticalAlign, integralsYDomains },
          id,
        );
      } else {
        return null;
      }
    },
    [activeSpectrum, height, integralsYDomains, margin, verticalAlign],
  );

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
            .filter(
              (d) =>
                d.display.isVisible === true &&
                d.display.isVisibleInDomain === true,
            )
            .filter(isSpectrum1D)
            .map((spectrum) =>
              spectrum.integrals.values.map((integral) => (
                <Integral
                  key={integral.id}
                  integralData={integral}
                  x={spectrum.data.x}
                  y={spectrum.data.y}
                  isActive={isActive(spectrum.id)}
                  xDomain={xDomain}
                  scaleY={scaleY(spectrum.id)}
                  scaleX={scaleX}
                />
              )),
            )}
      </g>
    );
  }, [activeSpectrum, data, scaleX, scaleY, xDomain]);

  return <g clipPath={`url(#${displayerKey}clip-chart-1d)`}>{Integrals}</g>;
}

export default IntegralsSeries;
