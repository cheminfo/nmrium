import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { XY } from 'ml-spectra-processing';
import { jsx, css } from '@emotion/core';

import { useChartData } from '../context/ChartContext';

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
    scaleX,
    scaleY,
    verticalAlign,
    activeSpectrum,
    data,
  } = useChartData();

  const paths = useMemo(() => {
    function makePath(info) {
      const { id, x, y } = info;
      if (x && y) {
        const pathPoints = XY.reduce(info, {
          from: xDomain[0],
          to: xDomain[1],
        });
        const _scaleY = scaleY(id);
        let path = `M ${scaleX(pathPoints.x[0])} ${_scaleY(pathPoints.y[0])} `;
        path += pathPoints.x.slice(1).reduce((accumulator, point, i) => {
          accumulator += ` L ${scaleX(point)} ${_scaleY(pathPoints.y[i + 1])}`;
          return accumulator;
        }, '');
        return path;
      } else {
        return null;
      }
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
          : 0
        : verticalAlign.value;
    }

    return (
      data &&
      data
        .filter((d) => d.isVisible === true && d.isVisibleInDomain === true)
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
            transform={`translate(0,-${getVerticalAlign(i + 1)})`}
          />
        ))
    );
  }, [
    activeSpectrum,
    data,
    scaleX,
    scaleY,
    verticalAlign.flag,
    verticalAlign.stacked,
    verticalAlign.value,
    xDomain,
  ]);

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
