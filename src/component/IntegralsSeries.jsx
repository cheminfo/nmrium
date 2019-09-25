import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { XY } from 'ml-spectra-processing';
import * as d3 from 'd3';

import { useChartData } from './context/ChartContext';
import IntegralResizable from './IntegralResizable';

const IntegralsSeries = () => {
  const {
    xDomain,
    getScale,
    verticalAlign,
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
    const makePath = (data) => {
      const { id, x, y, yDomain } = data;
      const xScale = getScale(id).x;
      let yScale = null;
      console.log(zoomFactor);
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
          (d, i) =>
            d.integrals &&
            d.integrals.map((integral) => (
              <g key={integral.id}>
                <IntegralResizable
                  id={d.id}
                  integralID={integral.id}
                  x={integral.x}
                  y={integral.y}
                  from={integral.from}
                  to={integral.to}
                  yDomain={d.integralsYDomain}
                />
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
                  // transform={`translate(0,${i * verticalAlign})`}
                  vectorEffect="non-scaling-stroke"
                  // transform={`translate(0,${
                  //   verticalAlign === 0 ? 120 : 120 + i * verticalAlign
                  // }) scale(1,8)`}
                />
              </g>
            )),
        )
    );
  }, [data, getScale, getYScale, xDomain, activeSpectrum]);

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
