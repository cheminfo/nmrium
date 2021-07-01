import { scaleLinear } from 'd3';

import { LAYOUT } from './DimensionLayout';

function get2DXScale(props: {
  width: number;
  margin: { right: number; left: number };
  xDomain: Array<number>;
}) {
  const { width, margin, xDomain } = props;
  return scaleLinear(xDomain, [width - margin.right, margin.left]);
}

function get2DYScale(
  props: {
    height: number;
    margin: { bottom: number; top: number };
    yDomain: Array<number>;
  },
  reverse = false,
) {
  const { height, margin, yDomain } = props;
  return scaleLinear(
    yDomain,
    reverse
      ? [height - margin.bottom, margin.top]
      : [margin.top, height - margin.bottom],
  );
}

interface TopLayout {
  width: number;
  margin: { right: number; left: number };
  xDomain: Array<number>;
}

interface LeftLayout {
  height: number;
  margin: { bottom: number; top: number };
  yDomain: Array<number>;
}

function get1DXScale(props: TopLayout | LeftLayout, layout: string) {
  if (![LAYOUT.TOP_1D, LAYOUT.LEFT_1D].includes(layout)) {
    throw new Error(
      `layout is required and must be ${LAYOUT.TOP_1D} or ${LAYOUT.LEFT_1D}  `,
    );
  }

  switch (layout) {
    case LAYOUT.TOP_1D: {
      const { width, margin, xDomain } = props as TopLayout;
      return scaleLinear(xDomain, [width - margin.right, margin.left]);
    }
    case LAYOUT.LEFT_1D: {
      const { height, margin, yDomain } = props as LeftLayout;
      return scaleLinear(yDomain, [height - margin.bottom, margin.top]);
    }
    default:
      break;
  }
}

function get1DYScale(yDomain: Array<number>, height: number, margin = 10) {
  return scaleLinear(yDomain, [height - margin, margin]);
}

export { get2DXScale, get2DYScale, get1DXScale, get1DYScale };
