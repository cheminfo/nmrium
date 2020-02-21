/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useContext, memo } from 'react';

import { MouseContext } from '../EventsTrackers/MouseTracker';
import { useChartData } from '../context/ChartContext';
import { BrushContext } from '../EventsTrackers/BrushTracker';

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
const FooterBanner = memo(({ frequency: frequencyProps }) => {
  let position = useContext(MouseContext);
  const { startX, endX, startY, endY, step } = useContext(BrushContext);
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

  const frequency = frequencyProps; // should be spectrum.info.frequency;

  return (
    <div css={styles}>
      <div>
        <span className="label"> X :</span>
        <span className="value">
          {scaleX.invert(position.x).toPrecision(6)}
        </span>
        <span className="unit">ppm</span>
      </div>
      {frequency && (
        <div>
          <span className="label"> X :</span>
          <span className="value">
            {(scaleX.invert(position.x) * frequency).toPrecision(6)}
          </span>
          <span className="unit">Hz</span>
        </div>
      )}
      <div>
        <span className="label"> Y :</span>
        <span className="value">
          {scaleY(activeSpectrum.id)
            .invert(position.y)
            .toFixed(2)}
        </span>
      </div>
      {step === 'brushing' && (
        <div>
          <span className="label"> Δppm :</span>
          <span className="value">
            {(scaleX.invert(startX) - scaleX.invert(endX)).toPrecision(6)}
          </span>
        </div>
      )}
      {frequency && step === 'brushing' && (
        <div>
          <span className="label"> ΔHz :</span>
          <span className="value">
            {(
              (scaleX.invert(startX) - scaleX.invert(endX)) *
              frequency
            ).toPrecision(5)}
          </span>
        </div>
      )}
      {step === 'brushing' && (
        <div>
          <span className="label"> ratio :</span>
          <span className="value">
            {(
              (scaleY(activeSpectrum.id).invert(endY) /
                (scaleY(activeSpectrum.id).invert(startY) ||
                  Number.MIN_VALUE)) *
              100
            ).toFixed(2)}
            %
          </span>
        </div>
      )}
    </div>
  );
});

export default FooterBanner;
