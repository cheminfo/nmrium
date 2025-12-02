import { xFindClosestIndex } from 'ml-spectra-processing';
import { Fragment, useMemo } from 'react';
import { MF } from 'react-mf';

import { get1DDataXY } from '../../data/data1d/Spectrum1D/index.js';
import {
  isFid2DData,
  isSpectrum2D,
} from '../../data/data2d/Spectrum2D/isSpectrum2D.js';
import { useBrushTracker } from '../EventsTrackers/BrushTracker.js';
import { useMouseTracker } from '../EventsTrackers/MouseTracker.js';
import { useChartData } from '../context/ChartContext.js';
import { FooterContainer, InfoItem } from '../elements/Footer.js';
import { useActiveSpectrum } from '../hooks/useActiveSpectrum.js';
import { useFormatNumberByNucleus } from '../hooks/useFormatNumberByNucleus.js';
import { options } from '../toolbar/ToolTypes.js';

import type { Spectrum1DTraces } from './useTracesSpectra.ts';
import type { Get2DDimensionLayoutReturn } from './utilities/DimensionLayout.js';
import { LAYOUT, getLayoutID } from './utilities/DimensionLayout.js';
import { get1DYScale, get2DXScale, get2DYScale } from './utilities/scale.js';

interface FooterBannerProps {
  layout: Get2DDimensionLayoutReturn;
  data1D: Spectrum1DTraces;
}

export default function FooterBanner(props: FooterBannerProps) {
  const { layout, data1D } = props;
  const position = useMouseTracker();
  const { startX, endX, startY, endY, step, mouseButton } = useBrushTracker();
  const {
    margin,
    width,
    height,
    xDomain,
    yDomain,
    yDomains,
    view: {
      spectra: { activeTab },
    },
    data: spectra,
    toolOptions: { selectedTool },
    mode,
  } = useChartData();

  const activeSpectrum = useActiveSpectrum();
  const trackID =
    position &&
    getLayoutID(layout, {
      startX: position.x,
      startY: position.y,
    });

  const nuclei = activeTab.split(',');
  const [formatX, formatY] = useFormatNumberByNucleus(nuclei);
  const hasTraces = data1D.x || data1D.y;

  const scaleX = useMemo(() => {
    if (selectedTool === options.slicing.id || !trackID) {
      return null;
    }

    if (!hasTraces || trackID === 'MAIN' || trackID === 'TOP') {
      return get2DXScale({ width, margin, xDomain, mode });
    }

    return get2DYScale({ height, margin, yDomain });
  }, [
    hasTraces,
    selectedTool,
    width,
    margin,
    xDomain,
    mode,
    trackID,
    height,
    yDomain,
  ]);

  const scaleY = useMemo(() => {
    if (selectedTool === options.slicing.id || !trackID) {
      return null;
    }

    if (!hasTraces || trackID === 'MAIN') {
      return get2DYScale({ height, margin, yDomain });
    }

    if (trackID === 'TOP') {
      return data1D.x ? get1DYScale(yDomains[data1D.x.id], margin.top) : null;
    }

    return data1D.y ? get1DYScale(yDomains[data1D.y.id], margin.left) : null;
  }, [
    data1D.x,
    data1D.y,
    hasTraces,
    height,
    margin,
    selectedTool,
    trackID,
    yDomain,
    yDomains,
  ]);
  if (
    !activeSpectrum ||
    !position ||
    position.y < 10 ||
    position.x < 10 ||
    position.x > width - margin.right ||
    position.y > height - margin.bottom
  ) {
    return <FooterContainer />;
  }
  const getRealYValue = (coordinate: any) => {
    let axis: 'x' | 'y' | null = null;
    if (trackID === LAYOUT.top) {
      axis = 'x';
    } else if (trackID === LAYOUT.left) {
      axis = 'y';
    }
    const spectrum = axis && data1D[axis];

    if (!scaleX || !spectrum) {
      return 1;
    }

    const datum = get1DDataXY(spectrum);
    const xIndex = xFindClosestIndex(datum.x, scaleX.invert(coordinate));
    return datum.y[xIndex];
  };

  const getXValue = (x: number | null = null) => {
    if (!scaleX || !trackID) return 0;

    if (trackID === 'MAIN') {
      return scaleX.invert(x || position.y);
    }
    // return if the trackID = "MAIN" | "TOP"
    return scaleX.invert(x || position.x);
  };

  const getYValue = () => {
    if (!scaleY || !trackID) return 0;

    if (trackID === 'LEFT') {
      return scaleY.invert(position.x);
    }

    return scaleY.invert(position.y);
  };

  const getRation = () => {
    if (!trackID || trackID === 'MAIN') return 0;

    if (trackID === 'TOP') {
      return (
        (getRealYValue(startX) / (getRealYValue(endX) || Number.MIN_VALUE)) *
        100
      ).toFixed(2);
    }

    // tracKId = "LEFT"
    return (
      (getRealYValue(startY) / (getRealYValue(endY) || Number.MIN_VALUE)) *
      100
    ).toFixed(2);
  };

  const getDeltaX = () => {
    if (!trackID || trackID === 'MAIN') return 0;

    if (trackID === 'TOP') {
      return (getXValue(startX) - getXValue(endX)).toPrecision(6);
    }

    return (getXValue(startY) - getXValue(endY)).toPrecision(6);
  };

  const getLabel = (label2d: any, label1d: any, nucleus: any) => {
    return trackID === LAYOUT.main ? (
      <Fragment>
        {label2d} ( <MF mf={nucleus} /> )
      </Fragment>
    ) : (
      label1d
    );
  };

  const getZValue = () => {
    const spectrum = spectra[activeSpectrum.index];

    if (trackID === LAYOUT.main && isSpectrum2D(spectrum)) {
      const { data } = spectrum;
      const { maxX, maxY, minX, minY, z } = isFid2DData(data)
        ? data.re
        : data.rr;

      const xStep = (maxX - minX) / (z[0].length - 1);
      const yStep = (maxY - minY) / (z.length - 1);
      const xIndex = Math.floor((getXValue() - minX) / xStep);
      const yIndex = Math.floor((getYValue() - minY) / yStep);

      if (xIndex < 0 || xIndex >= z[0].length) return 0;
      if (yIndex < 0 || yIndex >= z.length) return 0;

      return z[yIndex][xIndex];
    }
    return 0;
  };

  const isBrushing = step === 'brushing' && mouseButton === 'main';

  return (
    <FooterContainer>
      <InfoItem>
        <InfoItem.Label>{getLabel('F2', 'X', nuclei[0])} :</InfoItem.Label>
        <InfoItem.Value>{formatX(getXValue())}</InfoItem.Value>
        <InfoItem.Unit>ppm</InfoItem.Unit>
      </InfoItem>

      <InfoItem>
        <InfoItem.Label>{getLabel('F1', 'Y', nuclei[1])} :</InfoItem.Label>
        <InfoItem.Value>{formatY(getYValue())}</InfoItem.Value>
        <InfoItem.Unit>ppm</InfoItem.Unit>
      </InfoItem>
      <InfoItem autoHide>
        <InfoItem.Label>Intensity :</InfoItem.Label>
        <InfoItem.Value>{getZValue()}</InfoItem.Value>
      </InfoItem>
      {isBrushing && (
        <InfoItem autoHide>
          <InfoItem.Label> Δppm :</InfoItem.Label>
          <InfoItem.Value>{getDeltaX()}</InfoItem.Value>
        </InfoItem>
      )}

      {isBrushing && (
        <InfoItem autoHide>
          <InfoItem.Label> ratio :</InfoItem.Label>
          <InfoItem.Value>{getRation()}%</InfoItem.Value>
        </InfoItem>
      )}
    </FooterContainer>
  );
}
