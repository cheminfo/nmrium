/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { xFindClosestIndex } from 'ml-spectra-processing';
import { useContext, useCallback, Fragment, memo } from 'react';
import { BsCursor } from 'react-icons/bs';
import { IoPulseSharp } from 'react-icons/io5';

import { get1DDataXY } from '../../data/data1d/Spectrum1D/get1DDataXY';
import { Datum1D } from '../../data/types/data1d';
import { BrushContext } from '../EventsTrackers/BrushTracker';
import { MouseContext } from '../EventsTrackers/MouseTracker';
import { useChartData } from '../context/ChartContext';
import { useScaleChecked } from '../context/ScaleContext';
import { useFormatNumberByNucleus } from '../hooks/useFormatNumberByNucleus';
import useSpectrum from '../hooks/useSpectrum';
import { ActiveSpectrum, useActiveSpectrum } from '../reducer/Reducer';

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

interface FooterBannerInnerProps {
  margin: {
    top: number;
    left: number;
    right: number;
    bottom: number;
  };
  width: number;
  height: number;
  activeSpectrum: ActiveSpectrum | null;
  spectrum: Datum1D;
  activeTab: string;
}

function FooterBannerInner({
  margin,
  width,
  height,
  activeSpectrum,
  spectrum,
  activeTab,
}: FooterBannerInnerProps) {
  let position = useContext(MouseContext);
  const { startX, endX, step } = useContext(BrushContext);
  const { scaleX } = useScaleChecked();

  const format = useFormatNumberByNucleus(activeTab);

  const getYValue = useCallback(
    (xPosition) => {
      if (spectrum) {
        const data = get1DDataXY(spectrum);
        const xIndex = xFindClosestIndex(data.x, scaleX().invert(xPosition));
        return data.y[xIndex];
      }
      return 1;
    },
    [spectrum, scaleX],
  );

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
        {activeSpectrum && spectrum?.info?.originFrequency && (
          <>
            <span className="value">
              &nbsp;(
              {format(
                scaleX().invert(position.x) * spectrum?.info?.originFrequency,
                'hz',
              )}
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
          {spectrum?.info?.originFrequency && step === 'brushing' && (
            <div>
              <span className="label"> ΔHz: </span>
              <span className="value">
                {(
                  (scaleX().invert(startX) - scaleX().invert(endX)) *
                  spectrum?.info?.originFrequency
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

const MemoizedFooterBanner = memo(FooterBannerInner);

export default function FooterBanner() {
  const {
    margin,
    width,
    height,
    view: {
      spectra: { activeTab },
    },
  } = useChartData();
  const activeSpectrum = useActiveSpectrum();
  const spectrum = useSpectrum(null) as Datum1D;
  return (
    <MemoizedFooterBanner
      {...{ margin, width, height, activeSpectrum, spectrum, activeTab }}
    />
  );
}
