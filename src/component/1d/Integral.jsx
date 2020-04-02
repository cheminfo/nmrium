import { XY } from 'ml-spectra-processing';
import React, { useEffect, useState, useCallback, Fragment } from 'react';

import { useScale } from '../context/ScaleContext';

import IntegralResizable from './IntegralResizable';

const Integral = ({
  x,
  y,
  from,
  to,
  xDomain,
  isActive,
  integralID,
  spectrumID,
}) => {
  const { scaleX, scaleY } = useScale();
  const [integral, setIntegral] = useState();

  useEffect(() => {
    const integralResult = XY.integral(
      { x: x, y: y },
      {
        from: from,
        to: to,
        reverse: true,
      },
    );
    setIntegral(integralResult);
  }, [from, to, x, y]);

  const makePath = useCallback(() => {
    if (integral && scaleY) {
      const pathPoints = XY.reduce(integral, {
        from: xDomain[0],
        to: xDomain[1],
        nbPoints: 200,
        optimize: true,
      });

      let path = `M ${scaleX()(pathPoints.x[0])} ${scaleY(pathPoints.y[0])}`;

      path += pathPoints.x
        .slice(1)
        .map((point, i) => {
          return ` L ${scaleX()(point)} ${scaleY(pathPoints.y[i])}`;
        })
        .join('');
      //   console.log(path);
      return path;
    } else {
      return '';
    }
  }, [integral, scaleX, scaleY, xDomain]);

  return (
    <Fragment>
      <path
        className="line"
        stroke="black"
        fill="none"
        style={{
          transformOrigin: 'center top',
          opacity: isActive ? 1 : 0.2,
        }}
        d={makePath()}
        // vectorEffect="non-scaling-stroke"
      />

      <IntegralResizable
        spectrumID={spectrumID}
        integralID={integralID}
        integralData={integral}
        from={from}
        to={to}
        scaleY={scaleY}
      />
    </Fragment>
  );
};

export default Integral;
