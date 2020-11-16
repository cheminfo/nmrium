import { jsx, css } from '@emotion/react';
import PropTypes from 'prop-types';
import { useMemo } from 'react';
/** @jsx jsx */

import { useChartData } from '../context/ChartContext';
import { useScale } from '../context/ScaleContext';

import Integral from './Integral';
import { getIntegralYScale } from './utilities/scale';

const pathStyles = css`
  -webkit-clip-path: url('#clip');
  clip-path: url('#clip');

  path {
    fill: none;
    // stroke-linejoin: round;
    // stroke-linecap: round;
    // will-change: transform;
  }
`;
const IntegralsSeries = () => {
  const {
    xDomain,
    activeSpectrum,
    data,
    height,
    margin,
    verticalAlign,
    integralsYDomains,
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
          (d) => d.display.isVisible === true && d.isVisibleInDomain === true,
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
                  x={spectrum.x}
                  y={spectrum.y}
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

  return (
    <g css={pathStyles} clipPath="url(#clip)">
      {Integrals}
    </g>
  );
};

export default IntegralsSeries;

IntegralsSeries.contextTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  data: PropTypes.object,
  margin: PropTypes.shape({
    top: PropTypes.number.isRequired,
    right: PropTypes.number.isRequired,
    bottom: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
  }),
  xDomain: PropTypes.array,
  yDomain: PropTypes.array,
  getScale: PropTypes.func,
};
