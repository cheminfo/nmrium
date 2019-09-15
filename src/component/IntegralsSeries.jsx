import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { XY } from 'ml-spectra-processing';

import { useChartData } from './context/ChartContext';

const IntegralsSeries = () => {
  const {
    xDomain,
    getScale,
    verticalAlign,
    activeSpectrum,
    data,
  } = useChartData();

  const Integrals = useMemo(() => {
    const makePath = (data) => {
      const { id, x, y } = data;
      const scale = getScale(id);
      const pathPoints = XY.reduce(x, y, {
        from: xDomain[0],
        to: xDomain[1],
      });

      let path = `M ${scale.x(pathPoints.x[0])} ${scale.y(pathPoints.y[0])}`;

      path += pathPoints.x
        .slice(1)
        .map((point, i) => {
          return ` L ${scale.x(point)} ${scale.y(pathPoints.y[i])}`;
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
                d={makePath({ id: d.id, x: integral.x, y: integral.y })}
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
