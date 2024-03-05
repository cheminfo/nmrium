import { useMemo, CSSProperties } from 'react';

import { useBrushTracker } from '../../EventsTrackers/BrushTracker';
import { useMouseTracker } from '../../EventsTrackers/MouseTracker';
import { useChartData } from '../../context/ChartContext';
import { useActiveSpectrum } from '../../hooks/useActiveSpectrum';
import { useFormatNumberByNucleus } from '../../hooks/useFormatNumberByNucleus';
import { getLayoutID, LAYOUT } from '../utilities/DimensionLayout';
import { get1DYScale, useScale2DX, useScale2DY } from '../utilities/scale';

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
  zIndex: 9,
};

function XYLabelPointer({ layout, data1D }) {
  const position = useMouseTracker();
  const { step } = useBrushTracker();
  const {
    margin,
    width,
    height,
    yDomains,
    view: {
      spectra: { activeTab },
    },
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
  // const spectrum = useSpectrum();
  const scale2DX = useScale2DX();
  const scale2DY = useScale2DY();

  const scaleX = useMemo(() => {
    if (!activeSpectrum || !data1D || data1D.length === 0) {
      return scale2DX;
    }

    switch (trackID) {
      case LAYOUT.TOP_1D:
      case LAYOUT.CENTER_2D: {
        return scale2DX;
      }
      case LAYOUT.LEFT_1D: {
        return scale2DY;
      }
      default:
        return null;
    }
  }, [activeSpectrum, data1D, scale2DX, scale2DY, trackID]);

  const scaleY = useMemo(() => {
    if (!activeSpectrum || !data1D || data1D.length === 0) {
      return scale2DY;
    }
    switch (trackID) {
      case LAYOUT.CENTER_2D: {
        return scale2DY;
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
  }, [
    activeSpectrum,
    data1D,
    margin.left,
    margin.top,
    scale2DY,
    trackID,
    yDomains,
  ]);

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
        return scaleX?.invert(x || position.x);
      }
      case LAYOUT.LEFT_1D: {
        return scaleX?.invert(x || position.y);
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
