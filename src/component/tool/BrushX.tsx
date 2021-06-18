import { CSSProperties, useContext } from 'react';

import { BrushContext } from '../EventsTrackers/BrushTracker';
import { useChartData } from '../context/ChartContext';
import { options } from '../toolbar/ToolTypes';

const styles: Record<'container', CSSProperties> = {
  container: {
    transformOrigin: 'top left',
    position: 'absolute',
    top: '0px',
    left: '0px',
  },
};

const allowTools: Array<string | number> = [
  options.zoom.id,
  options.zeroFilling.id,
  options.peakPicking.id,
  options.integral.id,
  options.phaseCorrection.id,
  options.baseLineCorrection.id,
  options.rangesPicking.id,
  options.exclusionZones.id,
];

export default function BrushX() {
  const {
    width,
    height,
    toolOptions: { selectedTool },
  } = useChartData();
  const { startX, endX, step } = useContext(BrushContext);

  if (!allowTools.includes(selectedTool) || step !== 'brushing') return null;

  const scale = (endX - startX) / width;

  return (
    <div
      style={{
        ...styles.container,
        transform: `translate(${startX}px, 0px) scaleX(${scale})`,
        willChange: 'transform',
      }}
    >
      <svg width={width} height={height}>
        <line x1="0" y1="0" x2="0" y2={height} strokeWidth="8" stroke="red" />
        <line
          x1={width}
          y1="0"
          x2={width}
          y2={height}
          strokeWidth="8"
          stroke="red"
        />
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
}
