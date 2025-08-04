import styled from '@emotion/styled';
import type { ActiveSpectrum, Spectrum1D } from '@zakodium/nmrium-core';
import { xFindClosestIndex } from 'ml-spectra-processing';
import { memo } from 'react';
import { BsCursor } from 'react-icons/bs';
import { IoPulseSharp } from 'react-icons/io5';

import { get1DDataXY } from '../../data/data1d/Spectrum1D/get1DDataXY.js';
import { useBrushTracker } from '../EventsTrackers/BrushTracker.js';
import { useMouseTracker } from '../EventsTrackers/MouseTracker.js';
import { useChartData } from '../context/ChartContext.js';
import { useScaleChecked } from '../context/ScaleContext.js';
import { FooterContainer, InfoItem } from '../elements/Footer.js';
import { useActiveSpectrum } from '../hooks/useActiveSpectrum.js';
import { useFormatNumberByNucleus } from '../hooks/useFormatNumberByNucleus.js';
import useSpectrum from '../hooks/useSpectrum.js';

import { useInsetOptions } from './inset/InsetProvider.js';

const FlexInfoItem = styled(InfoItem)`
  align-items: center;
`;
const InfoBlock = styled(InfoItem)`
  white-space: nowrap;
`;

const Separator = styled.div`
  border-left: 2px solid gray;
  height: 10px;
  margin: 0 10px;
  width: 1px;
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
  const isInset = useInsetOptions();

  if (isInset) {
    return null;
  }

  if (
    !position ||
    position.y < margin.top ||
    position.x < margin.left ||
    position.x > width - margin.right ||
    position.y > height - margin.bottom
  ) {
    return <FooterContainer />;
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
    <FooterContainer>
      <BsCursor />
      <InfoBlock>
        <InfoItem.Label> 𝛅: </InfoItem.Label>
        <InfoItem.Value>{format(scaleX().invert(position.x))}</InfoItem.Value>
        <InfoItem.Unit>ppm</InfoItem.Unit>
        {activeSpectrum && spectrum?.info?.originFrequency && (
          <>
            <InfoItem.Value>
              &nbsp;(
              {format(
                scaleX().invert(position.x) * spectrum?.info?.originFrequency,
                'hz',
              )}
            </InfoItem.Value>
            <InfoItem.Unit>Hz</InfoItem.Unit>
            <InfoItem.Value>) </InfoItem.Value>
            <InfoItem>
              <span>,</span>
              <InfoItem.Label> Index: </InfoItem.Label>
              <InfoItem.Value>{getXIndex(position.x)}</InfoItem.Value>
            </InfoItem>
          </>
        )}
      </InfoBlock>

      {isBrushing && (
        <FlexInfoItem autoHide display="flex">
          <InfoItem.Label> Δppm: </InfoItem.Label>
          <InfoItem.Value>
            {(scaleX().invert(startX) - scaleX().invert(endX)).toPrecision(6)}
          </InfoItem.Value>
        </FlexInfoItem>
      )}

      {activeSpectrum && (
        <FlexInfoItem autoHide display="flex" hideThreshold={750}>
          {spectrum?.info?.originFrequency && isBrushing && (
            <InfoBlock>
              <InfoItem.Label> ΔHz: </InfoItem.Label>
              <InfoItem.Value>
                {(
                  (scaleX().invert(startX) - scaleX().invert(endX)) *
                  spectrum?.info?.originFrequency
                ).toPrecision(5)}
              </InfoItem.Value>
            </InfoBlock>
          )}
          {isBrushing && (
            <InfoBlock>
              <InfoItem.Label> ratio :</InfoItem.Label>
              <InfoItem.Value>
                {(
                  (getYValue(startX) / (getYValue(endX) || Number.MIN_VALUE)) *
                  100
                ).toFixed(2)}
                %
              </InfoItem.Value>
            </InfoBlock>
          )}
        </FlexInfoItem>
      )}

      {activeSpectrum && (
        <FlexInfoItem display="flex" autoHide hideThreshold={550}>
          <Separator />
          <IoPulseSharp />
          <InfoBlock>
            <InfoItem.Label>Intensity: </InfoItem.Label>
            <InfoItem.Value style={{ minWidth: 80 }}>
              {format(getYValue(position.x))}
            </InfoItem.Value>
          </InfoBlock>
        </FlexInfoItem>
      )}
    </FooterContainer>
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
