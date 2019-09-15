import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { XY } from 'ml-spectra-processing';

import { useChartData } from './context/ChartContext';

export default function LinesSeries() {
  const {
    xDomain,
    getScale,
    verticalAlign,
    activeSpectrum,
    data,
  } = useChartData();

  console.log('render line series');
  const paths = useMemo(() => {
    function makePath(data) {
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
    }

    function isActive(id) {
      return activeSpectrum === null
        ? true
        : id === activeSpectrum.id
        ? true
        : false;
    }

    return (
      data &&
      data[0] &&
      data[0].x &&
      data
        .filter((d) => d.isVisible === true)
        .map((d, i) => (
          <path
            className="line"
            key={`line-${d.id}-${i}`}
            stroke={d.color}
            style={{
              transformOrigin: 'center bottom',
              opacity: isActive(d.id) ? 1 : 0.2,
            }}
            d={makePath(d)}
            transform={`translate(0,${
              verticalAlign === 0 ? 0 : i * verticalAlign
            })`}
          />
        ))
    );
  }, [activeSpectrum, data, verticalAlign, getScale, xDomain]);

  return (
    <g className="paths" clipPath="url(#clip)">
      {paths}
    </g>
  );
}

LinesSeries.contextTypes = {
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
