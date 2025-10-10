import type { Spectrum1D } from '@zakodium/nmrium-core';
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

import type { Get2DDimensionLayoutReturn } from './utilities/DimensionLayout.js';
import { LAYOUT, getLayoutID } from './utilities/DimensionLayout.js';
import { get1DYScale, get2DXScale, get2DYScale } from './utilities/scale.js';

interface FooterBannerProps {
  layout: Get2DDimensionLayoutReturn;
  data1D: Spectrum1D[];
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

  const scaleX = useMemo(() => {
    if (!data1D || data1D.length === 0) {
      return get2DXScale({ width, margin, xDomain, mode });
    }
    if (selectedTool !== options.slicing.id) {
      switch (trackID) {
        case LAYOUT.top:
        case LAYOUT.main: {
          return get2DXScale({ width, margin, xDomain, mode });
        }
        case LAYOUT.left: {
          return get2DYScale({ height, margin, yDomain });
        }
        default:
          return null;
      }
    }
    return null;
  }, [
    data1D,
    height,
    margin,
    selectedTool,
    trackID,
    width,
    xDomain,
    yDomain,
    mode,
  ]);

  const scaleY = useMemo(() => {
    if (!data1D || data1D.length === 0) {
      return get2DYScale({ height, margin, yDomain });
    }
    if (selectedTool !== options.slicing.id) {
      switch (trackID) {
        case LAYOUT.main: {
          return get2DYScale({ height, margin, yDomain });
        }
        case LAYOUT.top: {
          return data1D[0]
            ? get1DYScale(yDomains[data1D[0].id], margin.top)
            : null;
        }
        case LAYOUT.left: {
          return data1D[1]
            ? get1DYScale(yDomains[data1D[1].id], margin.left)
            : null;
        }
        default:
          return null;
      }
    }
    return null;
  }, [data1D, height, margin, selectedTool, trackID, yDomain, yDomains]);

  if (
    !activeSpectrum ||
    !position ||
    position.y < 10 ||
    position.x < 10 ||
    position.x > width - margin.right ||
    position.y > height - margin.bottom ||
    !data1D
  ) {
    return <FooterContainer />;
  }
  const getRealYValue = (coordinate: any) => {
    let index: number | null = null;
    if (trackID === LAYOUT.top) {
      index = 0;
    } else if (trackID === LAYOUT.left) {
      index = 1;
    }
    if (index != null && scaleX != null && data1D[index]) {
      const datum = get1DDataXY(data1D[index]);
      const xIndex = xFindClosestIndex(datum.x, scaleX.invert(coordinate));
      return datum.y[xIndex];
    }
    return 1;
  };

  const getXValue = (x: number | null = null) => {
    if (scaleX != null) {
      switch (trackID) {
        case LAYOUT.main:
        case LAYOUT.top: {
          return scaleX.invert(x || position.x);
        }
        case LAYOUT.left: {
          return scaleX.invert(x || position.y);
        }
        default:
          return 0;
      }
    }
    return 0;
  };

  const getYValue = () => {
    if (scaleY != null) {
      switch (trackID) {
        case LAYOUT.main:
        case LAYOUT.top: {
          return scaleY.invert(position.y);
        }
        case LAYOUT.left: {
          return scaleY.invert(position.x);
        }
        default:
          return 0;
      }
    }
    return 0;
  };

  const getRation = () => {
    switch (trackID) {
      case LAYOUT.top: {
        return (
          (getRealYValue(startX) / (getRealYValue(endX) || Number.MIN_VALUE)) *
          100
        ).toFixed(2);
      }
      case LAYOUT.left: {
        return (
          (getRealYValue(startY) / (getRealYValue(endY) || Number.MIN_VALUE)) *
          100
        ).toFixed(2);
      }
      default:
        return 0;
    }
  };

  const getDeltaX = () => {
    switch (trackID) {
      case LAYOUT.top: {
        return (getXValue(startX) - getXValue(endX)).toPrecision(6);
      }
      case LAYOUT.left: {
        return (getXValue(startY) - getXValue(endY)).toPrecision(6);
      }
      default:
        return 0;
    }
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
