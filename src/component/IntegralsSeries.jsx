import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { XY } from 'ml-spectra-processing';
import * as d3 from 'd3';

import { useChartData } from './context/ChartContext';

const IntegralsSeries = () => {
  const {
    xDomain,
    getScale,
    verticalAlign,
    activeSpectrum,
    data,
    height,
    margin,
  } = useChartData();

  const Integrals = useMemo(() => {
    const makePath = (data) => {
      const { id, x, y, yDomain } = data;
      const xScale = getScale(id).x;

      console.log(yDomain);

      const yScale = d3.scaleLinear(yDomain, [
        height - margin.bottom,
        margin.top,
      ]);

      const pathPoints = XY.reduce(x, y, {
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
          (d, i) =>
            d.integrals &&
            d.integrals.map((integral, j) => (
              <path
                className="line"
                key={`integral-${d.id}-${j}`}
                stroke="black"
                style={{ opacity: IsActive(d.id) ? 1 : 0.2 }}
                d={makePath({
                  id: d.id,
                  x: integral.x,
                  y: integral.y,
                  yDomain: d.integralsYDomain,
                })}
                transform={`translate(0,${i * verticalAlign})`}
              />
            )),
        )
    );
  }, [data, activeSpectrum, getScale, verticalAlign, xDomain]);

  return (
    <g className="paths" clipPath="url(#clip)">
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
