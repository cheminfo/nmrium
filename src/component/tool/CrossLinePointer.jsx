import React, { useContext } from 'react';

import { BrushContext } from '../EventsTrackers/BrushTracker';
import { MouseContext } from '../EventsTrackers/MouseTracker';
import { useChartData } from '../context/ChartContext';
import { options } from '../toolbar/ToolTypes';

const styles = {
  line: {
    stroke: 'black',
    strokeOpacity: '1',
    shapeRendering: 'crispEdges',
    strokeWidth: '1',
    willChange: 'transform',
  },
};

const allowTools = [
  options.zoom.id,
  options.equalizerTool.id,
  options.baseLineCorrection.id,
  options.zone2D.id,
  options.slicingTool.id,
];

const CrossLinePointer = () => {
  const { height, width, margin, selectedTool } = useChartData();
  let position = useContext(MouseContext);
  const brushState = useContext(BrushContext);

  if (
    !allowTools.includes(selectedTool) ||
    brushState.step === 'brushing' ||
    !position ||
    // position.y < margin.top ||
    // position.x < margin.left ||
    position.x > width - margin.right ||
    position.y > height - margin.bottom ||
    !width ||
    !height
  ) {
    return null;
  }
  return (
    <div
      className="moving-element"
      key="crossLine"
      style={{
        cursor: 'crosshair',
        transform: `translate(${-width + position.x}px, ${
          -height + position.y
        }px)`,
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        overflow: 'visible',
        width: 2 * width,
        height: 2 * height,
      }}
    >
      <svg width={2 * width} height={2 * height}>
        <line
          style={styles.line}
          x1={width}
          y1="0"
          x2={width}
          y2={height * 2}
          key="vertical_line"
        />
        <line
          style={styles.line}
          x1="0"
          y1={height}
          x2={width * 2}
          y2={height}
          key="horizontal_line"
        />
      </svg>
    </div>
  );
};

export default CrossLinePointer;
