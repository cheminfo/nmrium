import type { TextStyle } from '@zakodium/nmrium-core';
import type { SVGStyledLineProps, SVGStyledTextProps } from 'react-science/ui';

import { MARGIN } from '../reducer/core/Constants.ts';

export type AxisPosition = 'top' | 'bottom' | 'left' | 'right';

export interface AxisStyles {
  labelStyle: TextStyle;
  primaryTicks: { textStyle: TextStyle };
}

interface AxisLayoutOptions {
  axisPosition?: AxisPosition;
  // Fallback when no font size is set in the axis text styles.
  defaultFontSize?: number;
  tickLength?: number;
  tickPadding?: number;
  tickLabelWidth?: number;
  labelHeight?: number;
}

// Calculates shared rendering positions and the space required around an axis.
export function getAxisLayout(
  axis: AxisStyles,
  options: AxisLayoutOptions = {},
) {
  const {
    axisPosition = 'bottom',
    defaultFontSize = 10,
    tickLength = 6,
    tickPadding = 3,
    tickLabelWidth = 0,
  } = options;
  const tickFontSize = axis.primaryTicks.textStyle.fontSize ?? defaultFontSize;
  const labelFontSize = axis.labelStyle.fontSize ?? defaultFontSize;
  const isVertical = axisPosition === 'left' || axisPosition === 'right';
  const sign = axisPosition === 'left' || axisPosition === 'top' ? -1 : 1;
  const tickOffset = tickLength + tickPadding;

  const tickText: SVGStyledTextProps = isVertical
    ? {
        x: sign * tickOffset,
        dy: '0.32em',
        textAnchor: sign === -1 ? 'end' : 'start',
      }
    : {
        y: sign * tickOffset,
        dy: sign === -1 ? '0em' : '0.71em',
        textAnchor: 'middle',
      };
  const primaryLine: SVGStyledLineProps = isVertical
    ? { x1: sign * tickLength, x2: 0 }
    : { y1: sign * tickLength, y2: 0 };
  const secondaryLine: SVGStyledLineProps = isVertical
    ? { x1: (sign * tickLength) / 2, x2: 0 }
    : { y1: (sign * tickLength) / 2, y2: 0 };
  const labelBaselineOffset = 0.7;
  const labelY = Math.max(
    30,
    tickOffset +
      tickFontSize +
      tickPadding +
      labelFontSize * (1 - labelBaselineOffset),
  );
  const labelText: SVGStyledTextProps = {
    y: labelY,
    dy: `${labelBaselineOffset}em`,
    textAnchor: 'end',
  };
  const bottom = Math.max(
    MARGIN['1D'].bottom,
    Math.ceil(labelY + labelFontSize + tickPadding),
  );
  const rightLabelInset = tickPadding;
  const rightLabelText: SVGStyledTextProps = {
    transform: 'rotate(-90)',
    dominantBaseline: 'text-after-edge',
    textAnchor: 'end',
  };
  const right = Math.ceil(
    tickOffset +
      tickLabelWidth +
      tickPadding +
      (options.labelHeight ?? labelFontSize) +
      tickPadding,
  );

  return {
    fontSize: defaultFontSize,
    tickFontSize,
    tickLength,
    tickText,
    primaryLine,
    secondaryLine,
    labelText,
    rightLabelText,
    rightLabelInset,
    right,
    bottom,
  };
}
