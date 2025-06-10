import styled from '@emotion/styled';
import type { CSSProperties } from 'react';

import { isSpectrum1D } from '../../../data/data1d/Spectrum1D/isSpectrum1D.js';
import { isSpectrum2D } from '../../../data/data2d/Spectrum2D/isSpectrum2D.js';
import { useScale2DX } from '../../2d/utilities/scale.js';
import {
  detectBrushing,
  useBrushDetectionOptions,
  useBrushTracker,
} from '../../EventsTrackers/BrushTracker.js';
import type { BrushAxis } from '../../EventsTrackers/BrushTracker.js';
import { useChartData } from '../../context/ChartContext.js';
import { useScaleChecked } from '../../context/ScaleContext.js';
import useSpectrum from '../../hooks/useSpectrum.js';
import type { Margin } from '../../reducer/Reducer.js';
import { options } from '../../toolbar/ToolTypes.js';

const Label = styled.span`
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: center;
  font-size: 12px;
  will-change: transform;
  color: black;
`;

const baseStyles: CSSProperties = {
  transformOrigin: 'top left',
  position: 'absolute',
  top: '0px',
  left: '0px',
  zoom: '100%',
  willChange: 'transform',
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

interface BrushCoordinates {
  startX: number;
  startY: number;
  endX?: number;
  endY?: number;
}
const defaultDimensionBorder: BrushCoordinates = {
  startX: 0,
  startY: 0,
};

interface BrushXYProps {
  axis: BrushAxis;
  dimensionBorder?: BrushCoordinates;
  width?: number;
  height?: number;
  margin?: Margin;
  enableHorizontalGuideline?: boolean;
  enableVerticalGuideline?: boolean;
}

export default function BrushXY(props: BrushXYProps) {
  const {
    axis = 'XY',
    dimensionBorder = defaultDimensionBorder,
    width: widthProps,
    height: heightProps,
    margin: externalMargin,
    enableHorizontalGuideline = false,
    enableVerticalGuideline = false,
  } = props;
  const {
    width,
    height,
    toolOptions: { selectedTool },
    margin: innerMargin,
  } = useChartData();
  const brushDetectionOptions = useBrushDetectionOptions();
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
    {
      width: finalWidth,
      height: finalHeight,
      ...brushDetectionOptions,
    },
  );

  const scaleX = axis === 'X' || axis === 'XY' ? brush.scaleX : 1;
  const scaleY = axis === 'Y' || axis === 'XY' ? brush.scaleY : 1;

  startX = axis === 'Y' ? margin.left : brush.startX || margin.left;
  startY = axis === 'X' ? margin.top : brush.startY || margin.top;
  endX = axis === 'Y' ? finalWidth : brush.endX || finalWidth;
  endY = axis === 'X' ? finalHeight : brush.endY || finalHeight;

  let y1;
  let x1;

  if (brush.type === 'X') {
    y1 = Math.max(brushTracker.startY, margin.top);
  } else if (brush.type === 'XY') {
    y1 = Math.round((brushTracker.endY + brushTracker.startY) / 2);
  }
  if (brush.type === 'Y') {
    x1 = Math.max(brushTracker.startX, margin.left);
  } else if (brush.type === 'XY') {
    x1 = Math.round((brushTracker.endX + brushTracker.startX) / 2);
  }

  const invScaleX = 1 / scaleX;
  const invScaleY = 1 / scaleY;
  const horizontalScaleTransform = `scale(1, ${scaleY})`;
  const verticalScaleTransform = `scale(${scaleX}, 1)`;

  const styles = {
    horizontal: {
      ...baseStyles,
      transform: `${verticalScaleTransform} translate(${startX * invScaleX}px, ${y1}px)`,
      backgroundColor: 'red',
      height: `1px`,
      width: finalWidth,
    },
    baseHorizontalThreshold: {
      ...baseStyles,
      transformOrigin: 'center',
      backgroundColor: 'red',
      height: `${brush.yThreshold * 2}px`,
      width: '1px',
    },
    baseVerticalThreshold: {
      ...baseStyles,
      transformOrigin: 'center',
      backgroundColor: 'red',
      width: `${brush.xThreshold * 2}px`,
      height: '1px',
    },

    vertical: {
      ...baseStyles,
      transform: `${horizontalScaleTransform} translate(${x1}px, ${startY * invScaleY}px)`,
      backgroundColor: 'red',
      width: `1px`,
      height: finalHeight,
    },
    borderTop: {
      ...baseStyles,
      transform: `${verticalScaleTransform} translate(${startX * invScaleX}px, ${startY}px)`,
      backgroundColor: 'red',
      height: `1px`,
      width: finalWidth,
      opacity: 0.3,
    },
    borderBottom: {
      ...baseStyles,
      transform: `${verticalScaleTransform} translate(${startX * invScaleX}px, ${endY}px) `,
      backgroundColor: 'red',

      height: `1px`,
      width: finalWidth,
      opacity: 0.3,
    },
    borderLeft: {
      ...baseStyles,
      transform: `${horizontalScaleTransform} translate(${startX}px, ${startY * invScaleY}px) `,
      backgroundColor: 'red',
      width: `1px`,
      height: finalHeight,
      opacity: 0.3,
    },
    borderRight: {
      ...baseStyles,
      transform: `${horizontalScaleTransform} translate(${endX}px, ${startY * invScaleY}px) `,
      backgroundColor: 'red',
      width: `1px`,
      height: finalHeight,
      opacity: 0.3,
    },
    overlay: {
      ...baseStyles,
      transform: `scale(${scaleX}, ${scaleY})translate(${startX * invScaleX}px, ${startY * invScaleY}px)`,
      width: finalWidth,
      height: finalHeight,
      backgroundColor: 'rgba(0,0,0,0.1)',
    },
  };

  if (scaleX === 0 || scaleY === 0) return;

  const centerX = Math.round((brushTracker.endX + brushTracker.startX) / 2);
  const centerY = Math.round((brushTracker.endY + brushTracker.startY) / 2);

  return (
    <div
      style={{
        contain: 'layout style paint',
        display: 'block',
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
      }}
    >
      {/* Y Brush Lines */}
      {brush.type.includes('Y') && (
        <>
          <div style={styles.borderTop} />
          <div style={styles.borderBottom} />
        </>
      )}

      {/* X Brush Lines */}
      {brush.type.includes('X') && (
        <>
          <div style={styles.borderLeft} />
          <div style={styles.borderRight} />
        </>
      )}

      {/* Overlay */}
      <div style={styles.overlay} />

      {/* Horizontal guideline */}
      {typeof y1 === 'number' && axis === 'XY' && enableHorizontalGuideline && (
        <>
          <div style={styles.horizontal} />

          {/* Horizontal Threshold indicator */}
          {brush.type === 'X' && (
            <>
              {/* left threshold indicator */}

              <div
                style={{
                  ...styles.baseHorizontalThreshold,
                  transform: `translate(${startX}px,${y1 - brush.yThreshold}px)`,
                }}
              />
              {/* Right threshold indicator */}
              <div
                style={{
                  ...styles.baseHorizontalThreshold,
                  transform: `translate(${endX}px,${y1 - brush.yThreshold}px)`,
                }}
              />
            </>
          )}
          {/* Range distance */}
          <Label
            style={{
              transform: `translate(${centerX}px, ${y1}px) translate(-${brush.type === 'X' ? '50' : '100'}%,-100%)  `,
            }}
          >
            <DistanceValue start={startX} end={endX} axis="x" />
          </Label>
        </>
      )}
      {/* Vertical guideline */}
      {typeof x1 === 'number' && axis === 'XY' && enableVerticalGuideline && (
        <>
          <div style={styles.vertical} />

          {/* Vertical Threshold indicator */}

          {brush.type === 'Y' && (
            <>
              {/* left threshold indicator */}

              <div
                style={{
                  ...styles.baseVerticalThreshold,
                  transform: `translate(${x1 - brush.yThreshold}px,${startY}px)`,
                }}
              />
              {/* Right threshold indicator */}
              <div
                style={{
                  ...styles.baseVerticalThreshold,
                  transform: `translate(${x1 - brush.yThreshold}px,${endY}px)`,
                }}
              />
            </>
          )}
          {/* Range distance */}

          <Label
            style={{
              transformOrigin: 'top left',
              transform: `translate(${x1}px, ${centerY}px) rotate(-90deg) translate(${brush.type === 'Y' ? '-50%' : '14px'}, 0%)  `,
            }}
          >
            <DistanceValue start={startY} end={endY} axis="y" />
          </Label>
        </>
      )}
    </div>
  );
}

type DistanceProps =
  | {
      start: number;
      end: number;
      axis: 'x';
    }
  | {
      start: number;
      end: number;
      axis: 'y';
    };

function DistanceValue(props: DistanceProps) {
  const spectrum = useSpectrum();

  if (!spectrum) return;

  if (isSpectrum1D(spectrum)) {
    return <DistanceOneDimension {...props} />;
  }

  return <DistanceTwoDimension {...props} />;
}

function DistanceOneDimension(props: DistanceProps) {
  const { start, end, axis } = props;

  const spectrum = useSpectrum();
  const { scaleX } = useScaleChecked();

  if (!spectrum || !isSpectrum1D(spectrum)) return;

  if (axis !== 'x') {
    return;
  }

  const value = (
    (scaleX().invert(start) - scaleX().invert(end)) *
    spectrum.info.originFrequency
  ).toPrecision(5);

  return (
    <>
      <span style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
        {value}
      </span>
      <span>Hz</span>
    </>
  );
}

function DistanceTwoDimension(props: DistanceProps) {
  const { start, end, axis } = props;
  const spectrum = useSpectrum();
  const scaleX = useScale2DX();

  if (!spectrum || !isSpectrum2D(spectrum)) return;
  const value = (
    (scaleX.invert(start) - scaleX.invert(end)) *
    spectrum.info.originFrequency[axis === 'x' ? 0 : 1]
  ).toPrecision(5);
  return (
    <>
      <span style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
        {value}
      </span>
      <span>Hz</span>
    </>
  );
}
