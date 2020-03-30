import React from 'react';

import { useChartData } from '../context/ChartContext';

const Contours = () => {
  const { contours, scaleX, scaleY } = useChartData();

  const buildContourPath = (contour) => {
    const _scaleX = scaleX();
    const _scaleY = scaleY(null, null, true);
    // console.log(_scaleX(100));
    // console.log(_scaleY(100));
    // console.log(contour);
    let path = ` M ${_scaleX(contour[0].x)} ${_scaleY(contour[0].y)} `;
    path += contour.slice(1).reduce((acc, co) => {
      acc += ` L ${_scaleX(co.x)} ${_scaleY(co.y)} `;
      return acc;
    }, '');
    path += ' z';
    return path;
  };
  const colors = ['DarkRed', 'DarkBlue'];

  return contours && contours.length > 0 ? (
    <g clipPath="url(#clip)">
      {contours.map((contour, index) => {
        return contour.map((cont, innerIndex) => (
          <path
            key={innerIndex}
            fill="none"
            stroke={colors[index]}
            strokeWidth="1"
            d={buildContourPath(cont)}
          />
        ));
      })}
    </g>
  ) : null;
};

export default Contours;
