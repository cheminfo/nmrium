/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { xFindClosestIndex } from 'ml-spectra-processing';
import { useContext, useCallback, Fragment, memo } from 'react';
import { BsCursor } from 'react-icons/bs';
import { IoPulseSharp } from 'react-icons/io5';

import { BrushContext } from '../EventsTrackers/BrushTracker';
import { MouseContext } from '../EventsTrackers/MouseTracker';
import { useScale } from '../context/ScaleContext';
import { useHelptData } from '../elements/popup/Help';
import FooterWrapper from '../hoc/FooterWrapper';
import { useFormatNumberByNucleus } from '../utility/FormatNumber';

const styles = css`
  display: flex;
  flex-firection: row;
  align-items: center;
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

  .help {
    font-size: 6px;
    color: black;
  }

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
      display: inline-block;
    }
    .unit {
      font-weight: bold;
      font-size: 10px;
    }
    .xvalue {
      min-width: 50px;
    }
    .yvalue {
      min-width: 80px;
    }
  }

  .separator {
    border-left: 2px solid gray;
    margin: 0 20px;
    width: 1px;
    height: 100%;
  }
`;

const helpStyles = css`
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
  span {
    font-size: 10px;
    color: black;
    display: inline-block;
    text-overflow: ellipsis;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
  }
`;

interface FooterBannerProps {
  margin: {
    top: number;
    left: number;
    right: number;
    bottom: number;
  };
  width: number;
  height: number;
  activeSpectrum: {
    index: number;
  };
  data: Array<{
    info: { originFrequency: any };
    data: { x: Array<number>; y: Array<number> };
  }>;
  activeTab: string;
}

function FooterBanner({
  margin,
  width,
  height,
  activeSpectrum,
  data,
  activeTab,
}: FooterBannerProps) {
  let position = useContext(MouseContext);
  const { startX, endX, step } = useContext(BrushContext);
  const { scaleX } = useScale();
  const { helpText } = useHelptData();
  const { originFrequency: frequency } = activeSpectrum
    ? data[activeSpectrum.index].info
    : { originFrequency: undefined };

  const format = useFormatNumberByNucleus(activeTab);

  const getYValue = useCallback(
    (xPosition) => {
      if (activeSpectrum) {
        const xIndex = xFindClosestIndex(
          data[activeSpectrum.index].data.x,
          scaleX().invert(xPosition),
        );
        return data[activeSpectrum.index].data.y[xIndex];
      }
      return 1;
    },
    [activeSpectrum, data, scaleX],
  );

  if (helpText) {
    return (
      <div css={helpStyles}>
        <span className="help">{helpText}</span>
      </div>
    );
  }

  if (
    !position ||
    position.y < margin.top ||
    position.x < margin.left ||
    position.x > width - margin.right ||
    position.y > height - margin.bottom
  ) {
    return <div css={styles} />;
  }

  return (
    <div css={styles}>
      <BsCursor />
      <div>
        <span className="label"> 𝛅: </span>
        <span className="value">{format(scaleX().invert(position.x))}</span>
        <span className="unit">ppm</span>
        {activeSpectrum && frequency && (
          <>
            <span className="value">
              &nbsp;({format(scaleX().invert(position.x) * frequency, 'hz')}
            </span>
            <span className="unit">Hz</span>
            <span className="value">) </span>
          </>
        )}
      </div>

      {step === 'brushing' && (
        <div>
          <span className="label"> Δppm: </span>
          <span className="value">
            {(scaleX().invert(startX) - scaleX().invert(endX)).toPrecision(6)}
          </span>
        </div>
      )}
      {activeSpectrum && (
        <Fragment>
          {frequency && step === 'brushing' && (
            <div>
              <span className="label"> ΔHz: </span>
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
        </Fragment>
      )}
      {activeSpectrum && (
        <Fragment>
          <div className="separator" />
          <IoPulseSharp />
          <div>
            <span className="label">Intensity: </span>
            <span className="value yvalue">
              {format(getYValue(position.x))}
            </span>
          </div>
        </Fragment>
      )}
    </div>
  );
}

export default FooterWrapper(memo(FooterBanner));
