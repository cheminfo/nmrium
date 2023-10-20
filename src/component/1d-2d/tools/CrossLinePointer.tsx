import { CSSProperties } from 'react';

import { useBrushTracker } from '../../EventsTrackers/BrushTracker';
import { useMouseTracker } from '../../EventsTrackers/MouseTracker';
import { useChartData } from '../../context/ChartContext';
import { options } from '../../toolbar/ToolTypes';

const styles: Record<'line', CSSProperties> = {
  line: {
    stroke: 'black',
    strokeOpacity: 1,
    shapeRendering: 'crispEdges',
    strokeWidth: '1',
    willChange: 'transform',
  },
};

const allowTools = new Set([
  options.zoom.id,
  options.apodization.id,
  options.equalizer.id,
  options.baselineCorrection.id,
  options.phaseCorrectionTwoDimensions.id,
  options.zonePicking.id,
  options.slicing.id,
  options.integral.id,
  options.rangePicking.id,
  options.editRange.id,
  options.multipleSpectraAnalysis.id,
  options.exclusionZones.id,
  options.databaseRangesSelection.id,
  options.matrixGenerationExclusionZones.id,
]);

function CrossLinePointer() {
  const {
    height,
    width,
    margin,
    toolOptions: { selectedTool },
  } = useChartData();
  const position = useMouseTracker();
  const brushState = useBrushTracker();

  if (
    !allowTools.has(selectedTool) ||
    brushState.step === 'brushing' ||
    !position ||
    position.x > width - margin.right ||
    position.y > height - margin.bottom ||
    !width ||
    !height
  ) {
    return null;
  }
  return (
    <div
      key="crossLine"
      style={{
        willChange: 'transform',
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
        zIndex: 9,
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
}

export default CrossLinePointer;
