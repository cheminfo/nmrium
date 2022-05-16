import { useContext, useMemo, CSSProperties } from 'react';

import { BrushContext } from '../../EventsTrackers/BrushTracker';
import { MouseContext } from '../../EventsTrackers/MouseTracker';
import { useChartData } from '../../context/ChartContext';
import { useFormatNumberByNucleus } from '../../hooks/useFormatNumberByNucleus';
import { getLayoutID, LAYOUT } from '../utilities/DimensionLayout';
import { get2DXScale, get2DYScale, get1DYScale } from '../utilities/scale';

const style: CSSProperties = {
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

function XYLabelPointer({ layout, data1D }) {
  const position = useContext(MouseContext);
  const { step } = useContext(BrushContext);
  const {
    margin,
    width,
    height,
    xDomain,
    yDomain,
    yDomains,
    activeTab,
    activeSpectrum,
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
    if (!activeSpectrum || !data1D || data1D.length === 0) {
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
  }, [
    activeSpectrum,
    data1D,
    height,
    margin,
    trackID,
    width,
    xDomain,
    yDomain,
  ]);

  const scaleY = useMemo(() => {
    if (!activeSpectrum || !data1D || data1D.length === 0) {
      return get2DYScale({ height, margin, yDomain });
    }

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
  }, [activeSpectrum, data1D, height, margin, trackID, yDomain, yDomains]);

  if (
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
        return scaleX?.invert(x ? x : position.x);
      }
      case LAYOUT.LEFT_1D: {
        return scaleX?.invert(x ? x : position.y);
      }
      default:
        return 0;
    }
  };

  const getYValue = () => {
    switch (trackID) {
      case LAYOUT.CENTER_2D:
      case LAYOUT.TOP_1D: {
        return scaleY?.invert(position.y);
      }
      case LAYOUT.LEFT_1D: {
        return scaleY?.invert(position.x);
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
      <span>{formatY(getYValue())}</span>
      <span style={{ color: 'gray' }}>{','}</span>
      <span style={{ color: 'red' }}>{formatX(getXValue())}</span>
    </div>
  );
}

export default XYLabelPointer;
