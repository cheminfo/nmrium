import { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { XY } from 'ml-spectra-processing';
import * as d3 from 'd3';
/** @jsx jsx */
import { jsx, css } from '@emotion/core';

import { useChartData } from '../context/ChartContext';

import IntegralResizable from './IntegralResizable';

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
    getScale,
    activeSpectrum,
    data,
    height,
    margin,
  } = useChartData();

  const getYScale = useCallback(
    (yDomain) => {
      return d3.scaleLinear(yDomain, [height - margin.bottom, margin.top]);
    },
    [height, margin.bottom, margin.top],
  );

  const calculateIntegral = useCallback((x, y, from, to) => {
    const integralResult = XY.integral(
      { x: x, y: y },
      {
        from: from,
        to: to,
        reverse: true,
      },
    );
    return integralResult;
  }, []);

  const Integrals = useMemo(() => {
    const makePath = (info) => {
      const { id, x, y, yDomain, from, to } = info;
      const xScale = getScale(id).x;
      const yScale = getYScale(yDomain);

      const integralResult = calculateIntegral(x, y, from, to);

      const pathPoints = XY.reduce(integralResult.x, integralResult.y, {
        from: xDomain[0],
        to: xDomain[1],
      });

      let path = `M ${xScale(pathPoints.x[0])} ${yScale(pathPoints.y[0])}`;

      path += pathPoints.x
        .slice(1)
        .map((point, i) => {
          return ` L ${xScale(point)} ${yScale(pathPoints.y[i])}`;
        })
        .join('');

      return path;
    };

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
        .filter((d) => d.isVisible === true)
        .map(
          (spectrum) =>
            spectrum.integrals &&
            spectrum.integrals.values &&
            spectrum.integrals.values.map((integral) => (
              <g key={integral.id}>
                <path
                  className="line"
                  stroke="black"
                  fill="none"
                  style={{
                    transformOrigin: 'center top',
                    opacity: IsActive(spectrum.id) ? 1 : 0.2,
                  }}
                  d={makePath({
                    id: spectrum.id,
                    x: spectrum.x,
                    y: spectrum.y,
                    yDomain: spectrum.integralsYDomain,
                    from: integral.from,
                    to: integral.to,
                  })}
                  // vectorEffect="non-scaling-stroke"
                />

                <IntegralResizable
                  id={spectrum.id}
                  integralID={integral.id}
                  integralData={calculateIntegral(
                    spectrum.x,
                    spectrum.y,
                    integral.from,
                    integral.to,
                  )}
                  from={integral.from}
                  to={integral.to}
                  yDomain={spectrum.integralsYDomain}
                />
              </g>
            )),
        )
    );
  }, [data, getScale, getYScale, calculateIntegral, xDomain, activeSpectrum]);

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
