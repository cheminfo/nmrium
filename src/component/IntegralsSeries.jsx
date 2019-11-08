import { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { XY } from 'ml-spectra-processing';
import * as d3 from 'd3';
/** @jsx jsx */
import { jsx, css } from '@emotion/core';

import { useChartData } from './context/ChartContext';
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
    zoomFactor,
  } = useChartData();

  const getYScale = useCallback(
    (yDomain) => {
      return d3.scaleLinear(yDomain, [height - margin.bottom, margin.top]);
    },
    [height, margin.bottom, margin.top],
  );

  const Integrals = useMemo(() => {
    const makePath = (info) => {
      const { id, x, y, yDomain } = info;
      const xScale = getScale(id).x;
      let yScale = null;
      if (zoomFactor) {
        yScale = getYScale(yDomain);
      } else {
        const t = d3.zoomIdentity
          .translate(0, height - margin.bottom)
          .scale(40)
          .translate(0, -(height - margin.bottom));

        yScale = t.rescaleY(getYScale(yDomain));
      }
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
          (d) =>
            d.integrals &&
            d.integrals.map((integral) => (
              <g key={integral.id}>
                <path
                  className="line"
                  stroke="black"
                  style={{
                    transformOrigin: 'center top',
                    opacity: IsActive(d.id) ? 1 : 0.2,
                  }}
                  d={makePath({
                    id: d.id,
                    x: integral.x,
                    y: integral.y,
                    yDomain: d.integralsYDomain,
                  })}
                  // vectorEffect="non-scaling-stroke"
                />

                <IntegralResizable
                  id={d.id}
                  integralID={integral.id}
                  x={integral.x}
                  y={integral.y}
                  from={integral.from}
                  to={integral.to}
                  yDomain={d.integralsYDomain}
                />
              </g>
            )),
        )
    );
  }, [
    data,
    getScale,
    zoomFactor,
    xDomain,
    getYScale,
    height,
    margin.bottom,
    activeSpectrum,
  ]);

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
