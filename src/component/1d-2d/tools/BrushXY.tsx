import type { PopoverNextProps } from '@blueprintjs/core';
import { PopoverNext } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { isSpectrum1D, isSpectrum2D } from '@zakodium/nmrium-core';
import clamp from 'lodash/clamp.js';
import type { CSSProperties, ReactNode } from 'react';
import { useResizeObserver } from 'react-d3-utils';

import { useScale2DX } from '../../2d/utilities/scale.js';
import {
  detectBrushing,
  useBrushDetectionOptions,
  useBrushTracker,
} from '../../EventsTrackers/BrushTracker.js';
import type { BrushAxis } from '../../EventsTrackers/brush_tracker.types.ts';
import { useChartData } from '../../context/ChartContext.js';
import { useGlobal } from '../../context/GlobalContext.js';
import { useKeyModifiers } from '../../context/KeyModifierContext.tsx';
import { useScaleChecked } from '../../context/ScaleContext.js';
import useSpectrum from '../../hooks/useSpectrum.js';
import type { Margin } from '../../reducer/Reducer.js';
import type { Tool } from '../../toolbar/ToolTypes.js';

const LabelTarget = styled.div`
  pointer-events: none;
`;

const LabelWrapper = styled(LabelTarget)`
  position: absolute;
  top: 0;
  left: 0;
  will-change: transform;
`;

const LabelContent = styled.div<{ vertical: boolean }>`
  padding: 5px;
  color: black;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  ${({ vertical }) =>
    vertical && {
      writingMode: 'vertical-rl',
      transform: 'rotate(180deg)',
    }}
`;

const distanceLabelPopoverProps = {
  isOpen: true,
  interactionKind: 'hover',
  autoFocus: false,
  enforceFocus: false,
  openOnTargetFocus: false,
  canEscapeKeyClose: false,
  shouldReturnFocusOnClose: false,
  transitionDuration: 0,
  positioningStrategy: 'fixed',
  animation: 'minimal',
  autoUpdateOptions: { animationFrame: true },
} satisfies Partial<PopoverNextProps>;

function getDistanceLabelMiddleware(
  boundary: PopoverNextProps['boundary'],
  arrow: boolean,
  labelSize = 0,
): PopoverNextProps['middleware'] {
  return {
    shift: {
      boundary: boundary ?? 'clippingAncestors',
      mainAxis: true,
      crossAxis: true,
      padding: 4,
    },
    ...(!arrow && {
      offset: { mainAxis: -labelSize / 2 },
    }),
  };
}

interface DistanceLabelOptions {
  x: number;
  y: number;
  vertical?: boolean;
  arrow: boolean;
  span?: number;
  children: ReactNode;
}

function DistanceLabel(options: DistanceLabelOptions) {
  const { viewerRef } = useGlobal();
  const { x, y, vertical = false, arrow, span = 0, children } = options;
  const [ref, size] = useResizeObserver();
  const boundary = viewerRef ?? undefined;
  const targetStyle: CSSProperties = {
    width: vertical ? 0 : span,
    height: vertical ? span : 0,
  };

  return (
    <LabelWrapper
      style={{
        transform: `translate(${x}px, ${y}px)`,
        ...targetStyle,
      }}
    >
      <PopoverNext
        {...distanceLabelPopoverProps}
        boundary={boundary}
        arrow={arrow}
        placement={vertical ? 'top' : 'left'}
        middleware={getDistanceLabelMiddleware(
          boundary,
          arrow,
          vertical ? size?.height : size?.width,
        )}
        renderTarget={({ isOpen: _isOpen, ...targetProps }) => (
          <LabelTarget {...targetProps} style={targetStyle} />
        )}
        content={
          <LabelContent ref={ref} vertical={vertical}>
            {children}
          </LabelContent>
        }
      />
    </LabelWrapper>
  );
}

const baseStyles: CSSProperties = {
  transformOrigin: 'top left',
  position: 'absolute',
  top: '0px',
  left: '0px',
  zoom: '100%',
  willChange: 'transform',
};

type ModifierVisibilityRule = 'primary' | 'non-primary' | 'always';

const TOOL_VISIBILITY_RULES: Partial<Record<Tool, ModifierVisibilityRule>> = {
  alignTwoDimensionsSpectra: 'non-primary',
  zoom: 'always',
  apodization: 'always',
  apodizationDimension1: 'always',
  apodizationDimension2: 'always',
  zeroFilling: 'always',
  zeroFillingDimension1: 'always',
  zeroFillingDimension2: 'always',
  peakPicking: 'always',
  integral: 'always',
  phaseCorrection: 'always',
  phaseCorrectionTwoDimensions: 'always',
  baselineCorrection: 'always',
  rangePicking: 'always',
  zonePicking: 'always',
  slicing: 'always',
  multipleSpectraAnalysis: 'always',
  exclusionZones: 'always',
  databaseRangesSelection: 'always',
  matrixGenerationExclusionZones: 'always',
  inset: 'always',
};

function isBrushAllowed(selectedTool: Tool, isPrimary: boolean) {
  const rule = TOOL_VISIBILITY_RULES[selectedTool] ?? 'always';

  switch (rule) {
    case 'primary':
      return isPrimary;
    case 'non-primary':
      return !isPrimary;
    default:
      return true;
  }
}

interface BrushCoordinates {
  startX: number;
  startY: number;
  endX?: number;
  endY?: number;
}
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
    dimensionBorder,
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
  const spectrum = useSpectrum();
  const margin = externalMargin ?? innerMargin;
  const brushTracker = useBrushTracker();
  const { step, mouseButton } = brushTracker;
  let { startX, endX, startY, endY } = brushTracker;
  const { isPrimary } = useKeyModifiers();
  const finalWidth = widthProps ?? width - margin.left - margin.right;
  const finalHeight = heightProps ?? height - margin.top - margin.bottom;
  const minX = dimensionBorder?.startX ?? margin.left;
  const minY = dimensionBorder?.startY ?? margin.top;
  const maxX = dimensionBorder?.endX ?? minX + finalWidth;
  const maxY = dimensionBorder?.endY ?? minY + finalHeight;

  if (
    !isBrushAllowed(selectedTool, isPrimary) ||
    step !== 'brushing' ||
    mouseButton !== 'main' ||
    startX < minX ||
    startX > maxX ||
    startY < minY ||
    startY > maxY
  ) {
    return null;
  }

  endX = clamp(endX, minX, maxX);
  endY = clamp(endY, minY, maxY);
  const brush = detectBrushing(
    { startX, startY, endX, endY },
    {
      width: finalWidth,
      height: finalHeight,
      ...brushDetectionOptions,
      axis,
    },
  );

  let y1;
  let x1;

  if (brush.type === 'X') {
    y1 = Math.max(startY, margin.top);
  } else if (brush.type === 'XY') {
    y1 = Math.round((endY + startY) / 2);
  }
  if (brush.type === 'Y') {
    x1 = Math.max(startX, margin.left);
  } else if (brush.type === 'XY') {
    x1 = Math.round((endX + startX) / 2);
  }

  const scaleX = axis === 'X' || axis === 'XY' ? brush.scaleX : 1;
  const scaleY = axis === 'Y' || axis === 'XY' ? brush.scaleY : 1;

  if (scaleX === 0 || scaleY === 0) return;

  startX = axis === 'Y' || brush.type === 'Y' ? minX : brush.startX;
  startY = axis === 'X' || brush.type === 'X' ? minY : brush.startY;
  endX = axis === 'Y' || brush.type === 'Y' ? maxX : brush.endX;
  endY = axis === 'X' || brush.type === 'X' ? maxY : brush.endY;

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
        zIndex: '10',
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
      {typeof y1 === 'number' &&
        axis === 'XY' &&
        enableHorizontalGuideline &&
        spectrum && (
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
            <DistanceValue
              start={startX}
              end={endX}
              axis="x"
              x={brush.type === 'XY' ? startX : (startX + endX) / 2}
              y={y1}
              arrow={brush.type === 'XY'}
              span={brush.type === 'XY' ? endX - startX : 0}
            />
          </>
        )}
      {/* Vertical guideline */}
      {typeof x1 === 'number' &&
        axis === 'XY' &&
        enableVerticalGuideline &&
        spectrum && (
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

            <DistanceValue
              start={startY}
              end={endY}
              axis="y"
              x={x1}
              y={brush.type === 'XY' ? startY : (startY + endY) / 2}
              vertical
              arrow={brush.type === 'XY'}
              span={brush.type === 'XY' ? endY - startY : 0}
            />
          </>
        )}
    </div>
  );
}

type DistanceProps = Omit<DistanceLabelOptions, 'children'> &
  (
    | {
        start: number;
        end: number;
        axis: 'x';
      }
    | {
        start: number;
        end: number;
        axis: 'y';
      }
  );

function DistanceValue(props: DistanceProps) {
  const spectrum = useSpectrum();

  if (!spectrum) return;

  if (isSpectrum1D(spectrum)) {
    return <DistanceOneDimension {...props} />;
  }

  return <DistanceTwoDimension {...props} />;
}

function DistanceOneDimension(props: DistanceProps) {
  const { start, end, axis, ...labelOptions } = props;

  const spectrum = useSpectrum();
  const { scaleX } = useScaleChecked();

  if (!isSpectrum1D(spectrum)) return;

  if (axis !== 'x') {
    return;
  }

  const value = (
    (scaleX().invert(start) - scaleX().invert(end)) *
    spectrum.info.originFrequency
  ).toPrecision(5);

  return (
    <DistanceLabel {...labelOptions}>
      <span style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
        {value}
      </span>
      <span>Hz</span>
    </DistanceLabel>
  );
}

function DistanceTwoDimension(props: DistanceProps) {
  const { start, end, axis, ...labelOptions } = props;
  const spectrum = useSpectrum();
  const scaleX = useScale2DX();

  if (!isSpectrum2D(spectrum)) return;
  const value = (
    (scaleX.invert(start) - scaleX.invert(end)) *
    spectrum.info.originFrequency[axis === 'x' ? 0 : 1]
  ).toPrecision(5);
  return (
    <DistanceLabel {...labelOptions}>
      <span style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
        {value}
      </span>
      <span>Hz</span>
    </DistanceLabel>
  );
}
