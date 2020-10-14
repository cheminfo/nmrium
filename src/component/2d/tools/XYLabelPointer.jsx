import React, { useContext, useMemo } from 'react';

// import { getPeakLabelNumberDecimals } from '../../../data/defaults/default';
import { BrushContext } from '../../EventsTrackers/BrushTracker';
import { MouseContext } from '../../EventsTrackers/MouseTracker';
import { useChartData } from '../../context/ChartContext';
import { useFormatNumberByNucleus } from '../../utility/FormatNumber';
import { getLayoutID, LAYOUT } from '../utilities/DimensionLayout';
import { get2DXScale, get2DYScale, get1DYScale } from '../utilities/scale';

const style = {
  cursor: 'crosshair',
  transformOrigin: 'bottom right',
  position: 'absolute',
  top: '-18px',
  left: '-88px',
  fontWeight: 'bold',
  pointerEvents: 'none',
  overflow: 'visible',
  userSelect: 'none',
  width: '85px',
  textAlign: 'right',
};

const XYLabelPointer = ({ layout, data1D }) => {
  const position = useContext(MouseContext);
  const { step } = useContext(BrushContext);
  const {
    margin,
    width,
    height,
    activeSpectrum,
    xDomain,
    yDomain,
    yDomains,
    activeTab,
  } = useChartData();

  const trackID =
    position &&
    getLayoutID(layout, {
      startX: position.x,
      startY: position.y,
    });

  const nucleuses = activeTab.split(',');
  const format = useFormatNumberByNucleus(nucleuses);

  const scaleX = useMemo(() => {
    if (!data1D || data1D.length === 0) {
      return get2DXScale({ width, margin, xDomain });
    }
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
  }, [data1D, height, margin, trackID, width, xDomain, yDomain]);

  const scaleY = useMemo(() => {
    if (!data1D || data1D.length === 0) {
      return get2DYScale({ height, margin, yDomain });
    }

    switch (trackID) {
      case LAYOUT.CENTER_2D: {
        return get2DYScale({ height, margin, yDomain });
      }
      case LAYOUT.TOP_1D: {
        return get1DYScale(yDomains[data1D[0].id], margin.top);
      }
      case LAYOUT.LEFT_1D: {
        return get1DYScale(yDomains[data1D[1].id], margin.left);
      }
      default:
        return null;
    }
  }, [data1D, height, margin, trackID, yDomain, yDomains]);

  if (
    !activeSpectrum ||
    step === 'brushing' ||
    !position ||
    position.y < margin.top ||
    position.x < margin.left ||
    position.x > width - margin.right ||
    position.y > height - margin.bottom
  ) {
    return null;
  }

  const getXValue = (x = null) => {
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
  };

  const getYValue = () => {
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
  };

  return (
    <div
      key="xLabelPointer"
      style={{
        ...style,
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
    >
      <span>{format(getYValue(), nucleuses[1])}</span>
      <span style={{ color: 'gray' }}>{','}</span>
      <span style={{ color: 'red' }}>{format(getXValue(), nucleuses[0])}</span>
    </div>
  );
};

export default XYLabelPointer;
