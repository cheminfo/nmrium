/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { xFindClosestIndex } from 'ml-spectra-processing';
import { useContext, useCallback } from 'react';

import { BrushContext } from '../EventsTrackers/BrushTracker';
import { MouseContext } from '../EventsTrackers/MouseTracker';
import { useChartData } from '../context/ChartContext';
import { useScale } from '../context/ScaleContext';

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
  const { startX, endX, step } = useContext(BrushContext);
  const { margin, width, height, activeSpectrum, data } = useChartData();
  const { scaleX, scaleY } = useScale();

  const getYValue = useCallback(
    (xPosition) => {
      if (activeSpectrum) {
        const xIndex = xFindClosestIndex(
          data[activeSpectrum.index].x,
          scaleX().invert(xPosition),
        );
        return data[activeSpectrum.index].y[xIndex];
      }
      return 1;
    },
    [activeSpectrum, data, scaleX],
  );

  if (
    !activeSpectrum ||
    !position ||
    position.y < margin.top ||
    position.x < margin.left ||
    position.x > width - margin.right ||
    position.y > height - margin.bottom
  ) {
    return <div css={styles} />;
  }

  const frequency = data[activeSpectrum.index].info.frequency; // should be spectrum.info.frequency;

  return (
    <div css={styles}>
      <div>
        <span className="label"> X :</span>
        <span className="value">
          {scaleX().invert(position.x).toPrecision(6)}
        </span>
        <span className="unit">ppm</span>
      </div>
      {frequency && (
        <div>
          <span className="label"> X :</span>
          <span className="value">
            {(scaleX().invert(position.x) * frequency).toPrecision(6)}
          </span>
          <span className="unit">Hz</span>
        </div>
      )}
      <div>
        <span className="label"> Y :</span>
        <span className="value">
          {scaleY(activeSpectrum.id).invert(position.y).toFixed(2)}
        </span>
      </div>
      {step === 'brushing' && (
        <div>
          <span className="label"> Δppm :</span>
          <span className="value">
            {(scaleX().invert(startX) - scaleX().invert(endX)).toPrecision(6)}
          </span>
        </div>
      )}
      {frequency && step === 'brushing' && (
        <div>
          <span className="label"> ΔHz :</span>
          <span className="value">
            {(
              (scaleX().invert(startX) - scaleX().invert(endX)) *
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
              (getYValue(startX) / (getYValue(endX) || Number.MIN_VALUE)) *
              100
            ).toFixed(2)}
            %
          </span>
        </div>
      )}
    </div>
  );
};

export default FooterBanner;
