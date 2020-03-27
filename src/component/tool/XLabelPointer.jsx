import React, { useContext, useCallback } from 'react';

import { getPeakLabelNumberDecimals } from '../../data/defaults/default';
import { BrushContext } from '../EventsTrackers/BrushTracker';
import { MouseContext } from '../EventsTrackers/MouseTracker';
import { useChartData } from '../context/ChartContext';

const style = {
  cursor: 'crosshair',
  transformOrigin: 'bottom right',
  position: 'absolute',
  top: '-18px',
  left: '-30px',
  pointerEvents: 'none',
  overflow: 'visible',
  userSelect: 'none',
};

const XLabelPointer = () => {
  const {
    height,
    width,
    margin,
    scaleX,
    data,
    activeSpectrum,
  } = useChartData();
  let position = useContext(MouseContext);
  const brushState = useContext(BrushContext);
  const getXValue = useCallback(
    (xVal) => {
      const spectrumData = data.find((d) => d.id === activeSpectrum.id);
      if (spectrumData) {
        return scaleX()
          .invert(xVal)
          .toFixed(getPeakLabelNumberDecimals(spectrumData.info.nucleus));
      }
    },
    [data, activeSpectrum, scaleX],
  );

  if (
    !activeSpectrum ||
    brushState.step === 'brushing' ||
    !position ||
    position.y < margin.top ||
    position.x < margin.left ||
    position.x > width - margin.right ||
    position.y > height - margin.bottom
  ) {
    return null;
  }
  return (
    <div
      key="xLabelPointer"
      style={{
        ...style,
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
    >
      <span>{getXValue(position.x)}</span>
    </div>
  );
};

export default XLabelPointer;
