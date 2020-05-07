import React from 'react';

import { useChartData } from '../context/ChartContext';

import { get2DXScale, get2DYScale } from './utilities/scale';

const Contours = () => {
  const {
    margin,
    width,
    height,
    xDomain,
    yDomain,
    data,
    contours,
  } = useChartData();

  const buildContourPath = (contour) => {
    const _scaleX = get2DXScale({ margin, width, xDomain });
    const _scaleY = get2DYScale({ margin, height, yDomain });

    let path = ` M ${_scaleX(contour[0].x)} ${_scaleY(contour[0].y)} `;
    path += contour.slice(1).reduce((acc, co) => {
      acc += ` L ${_scaleX(co.x)} ${_scaleY(co.y)} `;
      return acc;
    }, '');
    path += ' z';
    return path;
  };

  return (
    <g clipPath="url(#clip)">
      {data
        .filter(
          (datum) =>
            datum.info.dimension === 2 && datum.display.isVisible === true,
        )
        .map((datum) => {
          const colors = [
            datum.display.positiveColor,
            datum.display.negativeColor,
          ];
          return (
            contours[datum.id] &&
            contours[datum.id].length > 0 &&
            contours[datum.id].map((contoursData, index) => {
              return contoursData.map((contour, innerIndex) => (
                <path
                  key={innerIndex}
                  fill="none"
                  stroke={colors[index]}
                  strokeWidth="1"
                  d={buildContourPath(contour)}
                />
              ));
            })
          );
        })}
    </g>
  );
};

export default Contours;
