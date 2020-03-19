import React, { useContext } from 'react';

import { useChartData } from '../context/ChartContext';
import { BrushContext } from '../EventsTrackers/BrushTracker';
import { options } from '../toolbar/ToolTypes';

const styles = {
  container: {
    transformOrigin: 'top left',
    position: 'absolute',
    top: '0px',
    left: '0px',
  },
};

const allowTools = [
  options.zoom.id,
  options.zeroFilling.id,
  options.peakPicking.id,
  options.integral.id,
  options.phaseCorrection.id,
  options.baseLineCorrection.id,
  options.rangesPicking.id,
];

export const BRUSH_TYPE = {
  X: 1,
  Y: 2,
  XY: 3,
};

const BrushXY = ({ brushType }) => {
  const { width, height, selectedTool } = useChartData();
  let { startX, endX, startY, endY, step } = useContext(BrushContext);

  if (!allowTools.includes(selectedTool) || step !== 'brushing') return null;

  const scaleX =
    brushType === BRUSH_TYPE.X || brushType === BRUSH_TYPE.XY
      ? (endX - startX) / width
      : 1;
  startX =
    brushType === BRUSH_TYPE.X || brushType === BRUSH_TYPE.XY ? startX : 0;

  const scaleY =
    brushType === BRUSH_TYPE.Y || brushType === BRUSH_TYPE.XY
      ? (endY - startY) / height
      : 1;
  startY =
    brushType === BRUSH_TYPE.Y || brushType === BRUSH_TYPE.XY ? startY : 0;

  return (
    <div
      style={{
        ...styles.container,
        transform: `translate(${startX}px, ${startY}px) scale(${scaleX},${scaleY})`,
      }}
      className="moving-element"
    >
      <svg width={width} height={height}>
        <rect
          x="0"
          y="0"
          width={width}
          height={height}
          fill="gray"
          opacity="0.2"
        />
      </svg>
    </div>
  );
};

BrushXY.deafultProps = {
  brushType: BRUSH_TYPE.XY,
};

export default BrushXY;
