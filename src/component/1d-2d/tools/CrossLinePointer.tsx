import styled from '@emotion/styled';

import type { BrushAxis } from '../../EventsTrackers/BrushTracker.js';
import { useBrushTracker } from '../../EventsTrackers/BrushTracker.js';
import { useMouseTracker } from '../../EventsTrackers/MouseTracker.js';
import { useChartData } from '../../context/ChartContext.js';
import type { Margin } from '../../reducer/Reducer.js';
import { options } from '../../toolbar/ToolTypes.js';

const Line = styled.line`
  stroke: black;
  stroke-opacity: 1;
  shape-rendering: crispedges;
  stroke-width: 1;
  will-change: transform;
`;
const allowTools = new Set([
  options.zoom.id,
  options.apodization.id,
  options.apodizationDimension1.id,
  options.apodizationDimension2.id,
  options.baselineCorrection.id,
  options.phaseCorrectionTwoDimensions.id,
  options.zonePicking.id,
  options.slicing.id,
  options.zeroFillingDimension1.id,
  options.zeroFillingDimension2.id,
  options.integral.id,
  options.rangePicking.id,
  options.multipleSpectraAnalysis.id,
  options.exclusionZones.id,
  options.databaseRangesSelection.id,
  options.matrixGenerationExclusionZones.id,
  options.inset.id,
]);

interface DimensionBorder {
  startX: number;
  startY: number;
  endX?: number;
  endY?: number;
}

const defaultDimensionBorder: DimensionBorder = {
  startX: 0,
  startY: 0,
};

interface CrossLinePointerProps {
  axis?: BrushAxis;
  dimensionBorder?: DimensionBorder;
  width?: number;
  height?: number;
  margin?: Margin;
}

function CrossLinePointer(props: CrossLinePointerProps) {
  const {
    axis = 'XY',
    dimensionBorder = defaultDimensionBorder,
    width: externalWidth,
    height: externalHeight,
    margin: externalMargin,
  } = props;

  const {
    height,
    width,
    margin: innerMargin,
    toolOptions: { selectedTool },
  } = useChartData();
  const position = useMouseTracker();
  const brushState = useBrushTracker();

  const margin = externalMargin ?? innerMargin;
  const finalWidth = externalWidth || width - margin.left - margin.right;
  const finalHeight = externalHeight || height - margin.top - margin.bottom;

  const {
    startX,
    startY,
    endX = finalWidth,
    endY = finalHeight,
  } = dimensionBorder;

  if (
    !allowTools.has(selectedTool) ||
    brushState.step === 'brushing' ||
    !position ||
    !width ||
    !height ||
    position.x < startX ||
    position.x > endX ||
    position.y < startY ||
    position.y > endY
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
        zIndex: 10,
      }}
    >
      <svg width={2 * width} height={2 * height}>
        {(axis === 'X' || axis === 'XY') && (
          <Line
            x1={width}
            y1="0"
            x2={width}
            y2={height * 2}
            key="vertical_line"
          />
        )}
        {(axis === 'Y' || axis === 'XY') && (
          <Line
            x1="0"
            y1={height}
            x2={width * 2}
            y2={height}
            key="horizontal_line"
          />
        )}
      </svg>
    </div>
  );
}

export default CrossLinePointer;
