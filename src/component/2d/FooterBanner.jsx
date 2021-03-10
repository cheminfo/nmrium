/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { xFindClosestIndex } from 'ml-spectra-processing';
import { useContext, useMemo, Fragment } from 'react';
import { MF } from 'react-mf';

import { BrushContext } from '../EventsTrackers/BrushTracker';
import { MouseContext } from '../EventsTrackers/MouseTracker';
import { useChartData } from '../context/ChartContext';
import { options } from '../toolbar/ToolTypes';
import { useFormatNumberByNucleus } from '../utility/FormatNumber';

import { getLayoutID, LAYOUT } from './utilities/DimensionLayout';
import { get2DXScale, get1DYScale, get2DYScale } from './utilities/scale';

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
    }
    .unit {
      font-weight: bold;
      font-size: 10px;
    }
  }
`;
function FooterBanner({ layout, data1D }) {
  const position = useContext(MouseContext);
  const { startX, endX, startY, endY, step } = useContext(BrushContext);
  const {
    margin,
    width,
    height,
    activeSpectrum,
    xDomain,
    yDomain,
    yDomains,
    activeTab,
    data,
    selectedTool,
  } = useChartData();

  const trackID =
    position &&
    getLayoutID(layout, {
      startX: position.x,
      startY: position.y,
    });

  const nucleuses = activeTab.split(',');
  const [formatX, formatY] = useFormatNumberByNucleus(nucleuses);

  const scaleX = useMemo(() => {
    if (!data1D || data1D.length === 0) {
      return get2DXScale({ width, margin, xDomain });
    }
    if (selectedTool !== options.slicingTool.id) {
      switch (trackID) {
        case LAYOUT.TOP_1D:
        case LAYOUT.CENTER_2D: {
          return get2DXScale({ width, margin, xDomain });
        }
        case LAYOUT.LEFT_1D: {
          return get2DYScale({ height, margin, yDomain });
        }
        default:
          return null;
      }
    }
    return null;
  }, [data1D, height, margin, selectedTool, trackID, width, xDomain, yDomain]);

  const scaleY = useMemo(() => {
    if (!data1D || data1D.length === 0) {
      return get2DYScale({ height, margin, yDomain });
    }
    if (selectedTool !== options.slicingTool.id) {
      switch (trackID) {
        case LAYOUT.CENTER_2D: {
          return get2DYScale({ height, margin, yDomain });
        }
        case LAYOUT.TOP_1D: {
          return data1D[0]
            ? get1DYScale(yDomains[data1D[0].id], margin.top)
            : null;
        }
        case LAYOUT.LEFT_1D: {
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
    position.y > height - margin.bottom
  ) {
    return <div css={styles} />;
  }
  const getRealYValue = (cordinate) => {
    let index = null;
    if (trackID === LAYOUT.TOP_1D) {
      index = 0;
    } else if (trackID === LAYOUT.LEFT_1D) {
      index = 1;
    }
    if (index != null && scaleX != null) {
      const xIndex = xFindClosestIndex(
        data1D[index].data.x,
        scaleX.invert(cordinate),
      );
      return data1D[index].data.y[xIndex];
    }
    return 1;
  };

  const getXValue = (x = null) => {
    if (scaleX != null) {
      switch (trackID) {
        case LAYOUT.CENTER_2D:
        case LAYOUT.TOP_1D: {
          return scaleX.invert(x ? x : position.x);
        }
        case LAYOUT.LEFT_1D: {
          return scaleX.invert(x ? x : position.y);
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
        case LAYOUT.CENTER_2D:
        case LAYOUT.TOP_1D: {
          return scaleY.invert(position.y);
        }
        case LAYOUT.LEFT_1D: {
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
      case LAYOUT.TOP_1D: {
        return (
          (getRealYValue(startX) / (getRealYValue(endX) || Number.MIN_VALUE)) *
          100
        ).toFixed(2);
      }
      case LAYOUT.LEFT_1D: {
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
      case LAYOUT.TOP_1D: {
        return (getXValue(startX) - getXValue(endX)).toPrecision(6);
      }
      case LAYOUT.LEFT_1D: {
        return (getXValue(startY) - getXValue(endY)).toPrecision(6);
      }
      default:
        return 0;
    }
  };

  const getLabel = (label2d, labelld, nucleus) => {
    return trackID === LAYOUT.CENTER_2D ? (
      <Fragment>
        {label2d} ( <MF mf={nucleus} /> )
      </Fragment>
    ) : (
      labelld
    );
  };

  const getZValue = () => {
    if (trackID === LAYOUT.CENTER_2D) {
      const { maxX, maxY, minX, minY, z } = data[activeSpectrum.index].data;

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

  return (
    <div css={styles}>
      <div>
        <span className="label">{getLabel('F2', 'X', nucleuses[0])} :</span>
        <span className="value">{formatX(getXValue())}</span>
        <span className="unit">ppm</span>
      </div>

      <div>
        <span className="label">{getLabel('F1', 'Y', nucleuses[1])} :</span>
        <span className="value">{formatY(getYValue())}</span>
        <span className="unit">ppm</span>
      </div>
      <div>
        <span className="label">Intensity :</span>
        <span className="value">{getZValue()}</span>
      </div>
      {step === 'brushing' && (
        <div>
          <span className="label"> Δppm :</span>
          <span className="value">{getDeltaX()}</span>
        </div>
      )}

      {step === 'brushing' && (
        <div>
          <span className="label"> ratio :</span>
          <span className="value">{getRation()}%</span>
        </div>
      )}
    </div>
  );
}

export default FooterBanner;
