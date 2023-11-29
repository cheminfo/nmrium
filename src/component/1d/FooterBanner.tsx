/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { xFindClosestIndex } from 'ml-spectra-processing';
import { ActiveSpectrum, Spectrum1D } from 'nmr-load-save';
import { memo } from 'react';
import { BsCursor } from 'react-icons/bs';
import { IoPulseSharp } from 'react-icons/io5';

import { get1DDataXY } from '../../data/data1d/Spectrum1D/get1DDataXY';
import { useBrushTracker } from '../EventsTrackers/BrushTracker';
import { useMouseTracker } from '../EventsTrackers/MouseTracker';
import { useChartData } from '../context/ChartContext';
import { useScaleChecked } from '../context/ScaleContext';
import { useActiveSpectrum } from '../hooks/useActiveSpectrum';
import { useFormatNumberByNucleus } from '../hooks/useFormatNumberByNucleus';
import useSpectrum from '../hooks/useSpectrum';

const styles = css`
  display: flex;
  align-items: center;
  pointer-events: bounding-box;
  user-select: none;
  background-color: #f7f7f7;
  height: 30px;
  padding: 6px;
  color: #8d0018;
  position: absolute;
  width: 100%;
  bottom: 0;
  container-type: inline-size;

  @container (max-width:600px) {
    .small-width-none {
      display: none !important;
    }
  }

  .flex-row {
    display: flex;
    align-items: center;
  }

  div {
    margin: 0 10px;
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

    .x-value {
      min-width: 50px;
    }

    .y-value {
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
  spectrum: Spectrum1D;
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
  const position = useMouseTracker();
  const { startX, endX, step, mouseButton } = useBrushTracker();
  const { scaleX } = useScaleChecked();

  const format = useFormatNumberByNucleus(activeTab);

  if (
    !position ||
    position.y < margin.top ||
    position.x < margin.left ||
    position.x > width - margin.right ||
    position.y > height - margin.bottom
  ) {
    return <div css={styles} />;
  }

  function getXIndex(xPosition) {
    if (spectrum) {
      const data = get1DDataXY(spectrum);
      return xFindClosestIndex(data.x, scaleX().invert(xPosition));
    }
    return 0;
  }

  function getYValue(xPosition) {
    if (spectrum) {
      const data = get1DDataXY(spectrum);
      const xIndex = getXIndex(xPosition);
      return data.y[xIndex];
    }
    return 1;
  }

  const isBrushing = step === 'brushing' && mouseButton === 'main';

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
            <span className="small-width-none">
              <span>,</span>
              <span className="label"> Index: </span>
              <span className="value">{getXIndex(position.x)}</span>
            </span>
          </>
        )}
      </div>

      {isBrushing && (
        <div className="flex-row small-width-none">
          <span className="label"> Δppm: </span>
          <span className="value">
            {(scaleX().invert(startX) - scaleX().invert(endX)).toPrecision(6)}
          </span>
        </div>
      )}

      {activeSpectrum && (
        <div className=" flex-row small-width-none">
          {spectrum?.info?.originFrequency && isBrushing && (
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
          {isBrushing && (
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
      )}

      {activeSpectrum && (
        <div className="flex-row small-width-none">
          <div className="separator" />
          <IoPulseSharp />
          <div>
            <span className="label">Intensity: </span>
            <span className="value y-value">
              {format(getYValue(position.x))}
            </span>
          </div>
        </div>
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
  const spectrum = useSpectrum(null) as Spectrum1D;
  return (
    <MemoizedFooterBanner
      {...{ margin, width, height, activeSpectrum, spectrum, activeTab }}
    />
  );
}
