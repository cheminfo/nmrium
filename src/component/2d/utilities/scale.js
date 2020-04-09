import { scaleLinear } from 'd3';

import { LAYOUT } from './DimensionLayout';

/***
 * props {width,margin,xDomain}
 */

function get2DXScale(props) {
  const { width, margin, xDomain } = props;
  return scaleLinear(xDomain, [width - margin.right, margin.left]);
}

/***
 * props {height,margin,yDomain}
 */
function get2DYScale(props) {
  const { height, margin, yDomain } = props;
  return scaleLinear(yDomain, [margin.top, height - margin.bottom]);
}

function get1DXScale(props, layout) {
  if (![LAYOUT.TOP_1D, LAYOUT.LEFT_1D].includes(layout)) {
    throw new Error(
      `layout is required and must be ${LAYOUT.TOP_1D} or ${LAYOUT.LEFT_1D}  `,
    );
  }

  switch (layout) {
    case LAYOUT.TOP_1D: {
      const { width, margin, xDomain } = props;
      return scaleLinear(xDomain, [width - margin.right, margin.left]);
    }
    case LAYOUT.LEFT_1D: {
      const { height, margin, yDomain } = props;
      return scaleLinear(yDomain, [height - margin.bottom, margin.top]);
    }
    default:
      break;
  }
}

function get1DYScale(yDomain, height, margin = 10) {
  return scaleLinear(yDomain, [height - margin, margin]);
}

export { get2DXScale, get2DYScale, get1DXScale, get1DYScale };
