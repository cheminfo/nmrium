/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useContext } from 'react';

import { MouseContext } from '../EventsTrackers/MouseTracker';
import { useChartData } from '../context/ChartContext';

const styles = css`
  pointer-events: bounding-box;
  user-select: 'none';
  -webkit-user-select: none; /* Chrome all / Safari all */
  -moz-user-select: none; /* Firefox all */
  background-color: #f7f7f7;
  height: 30px;
  padding: 6px;
  color: #8d0018;
  position: absolute;
  width: 100%;
  bottom: 0;
  div {
    margin: 0px 10px;
    display: inline-block;

    .label {
      font-size: 12px;
      color: #4d4d4d;
      font-weight: bold;
    }
    .value {
      font-weight: bold;
      font-size: 14px;
    }
    .unit {
      font-weight: bold;
      font-size: 10px;
    }
  }
`;
const FooterBanner = () => {
  let position = useContext(MouseContext);
  const {
    scaleX,
    scaleY,
    margin,
    width,
    height,
    activeSpectrum,
  } = useChartData();
  if (
    !activeSpectrum ||
    !position ||
    position.y < margin.top ||
    position.left < margin.left ||
    position.x > width - margin.right ||
    position.y > height - margin.bottom
  ) {
    return <div css={styles} />;
  }

  return (
    <div css={styles}>
      <div>
        <span className="label"> X :</span>
        <span className="value">{scaleX.invert(position.x).toFixed(2)}</span>
        <span className="unit">ppm</span>
      </div>
      <div>
        <span className="label"> X :</span>
        <span className="value">{scaleX.invert(position.x).toFixed(2)}</span>
        <span className="unit">Hz</span>
      </div>
      <div>
        <span className="label"> Y :</span>
        <span className="value">
          {scaleY(activeSpectrum.id)
            .invert(position.y)
            .toFixed(2)}
        </span>
        <span className="unit">ppm</span>
      </div>
    </div>
  );
};

export default FooterBanner;
