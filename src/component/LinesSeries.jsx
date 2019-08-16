import React, { useRef, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { XY } from 'ml-spectra-processing';
import { ChartContext } from './context/ChartContext';

export default function LinesSeries({ data }) {
  const refPathsContainer = useRef();
  const {
    width,
    height,
    margin,
    xDomain,
    getScale,
    verticalAlign,
    activeSpectrum,
  } = useContext(ChartContext);

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
            style={{ opacity: isActive(d.id) ? 1 : 0.2 }}
            d={makePath(d)}
            transform={`translate(0,${i * verticalAlign})`}
          />
        ))
    );
  }, [activeSpectrum, data, getScale, verticalAlign, xDomain]);

  return (
    <g key={'path'}>
      <defs>
        <clipPath id="clip">
          <rect
            width={`${width - margin.left - margin.right}`}
            height={`${height - margin.top - margin.bottom}`}
            x={`${margin.left}`}
            y={`${margin.top}`}
          />
        </clipPath>
      </defs>

      <g className="paths" ref={refPathsContainer} clipPath="url(#clip)">
        {paths}
      </g>
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
