import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { XY } from 'ml-spectra-processing';
import { jsx, css } from '@emotion/core';

import { useChartData } from './context/ChartContext';

/** @jsx jsx */

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

export const LinesSeries = () => {
  const {
    xDomain,
    getScale,
    verticalAlign,
    activeSpectrum,
    data,
  } = useChartData();

  const paths = useMemo(() => {
    function makePath(info) {
      const { id, x, y } = info;
      const scale = getScale(id);

      const pathPoints = XY.reduce(x, y, {
        from: xDomain[0],
        to: xDomain[1],
      });

      let path = `M ${scale.x(pathPoints.x[0])} ${scale.y(pathPoints.y[0])} `;
      path += pathPoints.x.slice(1).reduce((accumulator, point, i) => {
        accumulator += ` L ${scale.x(point)} ${scale.y(pathPoints.y[i + 1])}`;
        return accumulator;
      }, '');
      return path;
    }

    function isActive(id) {
      return activeSpectrum === null
        ? true
        : id === activeSpectrum.id
        ? true
        : false;
    }

    function getVerticalAlign(i) {
      return verticalAlign.flag
        ? verticalAlign.stacked
          ? i * verticalAlign.value
          : verticalAlign.value
        : verticalAlign.value;
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
            key={d.id}
            stroke={d.color}
            fill="none"
            style={{
              opacity: isActive(d.id) ? 1 : 0.2,
            }}
            d={makePath(d)}
            transform={`translate(0,-${getVerticalAlign(i)})`}
          />
        ))
    );
  }, [activeSpectrum, data, getScale, verticalAlign, xDomain]);

  return (
    <g css={pathStyles} clipPath="url(#clip)">
      {paths}
    </g>
  );
};
LinesSeries.whyDidYouRender = true;

export default LinesSeries;

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
