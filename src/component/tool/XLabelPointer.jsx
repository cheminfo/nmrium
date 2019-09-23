import React, { useContext } from 'react';

import { useChartData } from '../context/ChartContext';
import { MouseContext } from '../EventsTrackers/MouseTracker';
import '../css/cross-line-tool.css';
import { BrushContext } from '../EventsTrackers/BrushTracker';
import { getPeakLabelNumberDecimals } from '../../data/defaults/default';

const XLabelPointer = () => {
  const {
    height,
    width,
    margin,
    getScale,
    data,
    activeSpectrum,
  } = useChartData();
  let position = useContext(MouseContext);
  const brushState = useContext(BrushContext);
  const getXValue = (xVal) => {
    const spectrumData = data.find((d) => d.id === activeSpectrum.id);

    return getScale()
      .x.invert(xVal)
      .toFixed(getPeakLabelNumberDecimals(spectrumData.nucleus));
  };

  if (
    !activeSpectrum ||
    brushState.step === 'brushing' ||
    !position ||
    position.y < margin.top ||
    position.left < margin.left ||
    position.x > width - margin.right ||
    position.y > height - margin.bottom
  ) {
    return null;
  }
  return (
    <div
      key="xLabelPointer"
      style={{
        cursor: 'crosshair',
        transform: `translate(${position.x}px, ${position.y}px)`,
        transformOrigin: 'bottom right',
        position: 'absolute',
        top: '-14px',
        left: '-26px',
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      <span>{getXValue(position.x)}</span>
    </div>
  );
};

export default XLabelPointer;
