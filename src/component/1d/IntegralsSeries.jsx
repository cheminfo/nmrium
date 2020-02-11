import { useMemo } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
/** @jsx jsx */
import { jsx, css } from '@emotion/core';

import { useChartData } from '../context/ChartContext';

import Integral from './Integral';

const pathStyles = css`
  -webkit-clip-path: url('#clip');
  clip-path: url('#clip');

  path {
    stroke-width: 1.5;
    fill: none;
    // stroke-linejoin: round;
    // stroke-linecap: round;
    // will-change: transform;
  }
`;
const IntegralsSeries = () => {
  const {
    xDomain,
    scaleX,
    activeSpectrum,
    data,
    height,
    margin,
    integralsYDomains,
  } = useChartData();

  const scaleY = useMemo(() => {
    if (activeSpectrum && integralsYDomains[activeSpectrum.id]) {
      const scale = d3.scaleLinear(integralsYDomains[activeSpectrum.id], [
        height - (margin.bottom + height * 0.3),
        margin.top,
      ]);
      return scale;
    } else {
      return null;
    }
  }, [activeSpectrum, height, integralsYDomains, margin]);

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
        .filter((d) => d.isVisible === true && d.isVisibleInDomain === true)
        .map(
          (spectrum) =>
            spectrum.integrals &&
            spectrum.integrals.values &&
            spectrum.integrals.values.map((integral) => (
              <g key={integral.id}>
                <Integral
                  spectrumID={spectrum.id}
                  integralID={integral.id}
                  from={integral.from}
                  to={integral.to}
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
