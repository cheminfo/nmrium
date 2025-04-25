import type { CSSProperties } from 'react';

import {
  detectBrushing,
  useBrushTracker,
} from '../../EventsTrackers/BrushTracker.js';
import type { BrushAxis } from '../../EventsTrackers/BrushTracker.js';
import { useChartData } from '../../context/ChartContext.js';
import type { Margin } from '../../reducer/Reducer.js';
import { options } from '../../toolbar/ToolTypes.js';

const styles: Record<'container', CSSProperties> = {
  container: {
    transformOrigin: 'top left',
    position: 'absolute',
    top: '0px',
    left: '0px',
    zoom: '100%',
    zIndex: 9,
  },
};

const allowTools = new Set([
  options.zoom.id,
  options.apodization.id,
  options.apodizationDimension1.id,
  options.apodizationDimension2.id,
  options.zeroFilling.id,
  options.zeroFillingDimension1.id,
  options.zeroFillingDimension2.id,
  options.peakPicking.id,
  options.integral.id,
  options.phaseCorrection.id,
  options.phaseCorrectionTwoDimensions.id,
  options.baselineCorrection.id,
  options.rangePicking.id,
  options.zonePicking.id,
  options.slicing.id,
  options.multipleSpectraAnalysis.id,
  options.exclusionZones.id,
  options.databaseRangesSelection.id,
  options.matrixGenerationExclusionZones.id,
  options.inset.id,
]);

const defaultDimensionBorder: {
  startX: number;
  startY: number;
  endX?: number;
  endY?: number;
} = {
  startX: 0,
  startY: 0,
};

interface BrushXYProps {
  axis: BrushAxis;
  dimensionBorder?: {
    startX: number;
    startY: number;
    endX?: number;
    endY?: number;
  };
  width?: number;
  height?: number;
  margin?: Margin;
}

export default function BrushXY(props: BrushXYProps) {
  const {
    axis = 'XY',
    dimensionBorder = defaultDimensionBorder,
    width: widthProps,
    height: heightProps,
    margin: externalMargin,
  } = props;
  const {
    width,
    height,
    toolOptions: { selectedTool },
    margin: innerMargin,
  } = useChartData();
  const margin = externalMargin ?? innerMargin;
  const brushTracker = useBrushTracker();
  const { step, mouseButton } = brushTracker;
  let { startX, endX, startY, endY } = brushTracker;
  if (
    !allowTools.has(selectedTool) ||
    step !== 'brushing' ||
    mouseButton !== 'main' ||
    !dimensionBorder ||
    (dimensionBorder.startX && startX < dimensionBorder.startX) ||
    (dimensionBorder.startY && startY < dimensionBorder.startY) ||
    ((dimensionBorder.endX && Math.sign(endX - startX) === 1
      ? endX > dimensionBorder.endX
      : endX < dimensionBorder.startX) &&
      (dimensionBorder.endX &&
      dimensionBorder.endY &&
      Math.sign(endY - startY) === 1
        ? endY > dimensionBorder.endY
        : endY < dimensionBorder.startY))
  ) {
    return null;
  }

  const finalWidth = widthProps || width - margin.left - margin.right;
  const finalHeight = heightProps || height - margin.top - margin.bottom;

  endX =
    dimensionBorder.endX && endX > dimensionBorder.endX
      ? dimensionBorder.endX
      : dimensionBorder.startX && endX < dimensionBorder.startX
        ? dimensionBorder.startX
        : endX;
  endY =
    dimensionBorder.endY && endY > dimensionBorder.endY
      ? dimensionBorder.endY
      : dimensionBorder.startY && endY < dimensionBorder.startY
        ? dimensionBorder.startY
        : endY;
  const brush = detectBrushing(
    { startX, startY, endX, endY },
    { width: finalWidth, height: finalHeight, thresholdFormat: 'fixed' },
  );

  const scaleX = axis === 'X' || axis === 'XY' ? brush.scaleX : 1;
  const scaleY = axis === 'Y' || axis === 'XY' ? brush.scaleY : 1;

  startX = axis === 'Y' ? margin.left : brush.startX || margin.left;
  startY = axis === 'X' ? margin.top : brush.startY || margin.top;

  return (
    <div
      style={{
        ...styles.container,
        transform: `translate(${startX}px, ${startY}px) scale(${scaleX},${scaleY})`,
        willChange: 'transform',
      }}
    >
      <svg width={finalWidth} height={finalHeight}>
        <rect
          x="0"
          y="0"
          width={finalWidth}
          height={finalHeight}
          fill="gray"
          opacity="0.2"
        />
      </svg>
    </div>
  );
}
