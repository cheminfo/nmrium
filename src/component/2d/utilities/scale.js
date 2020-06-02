import { scaleLinear } from 'd3';

import { LAYOUT } from './DimensionLayout';

/***
 * @param {object} props
 * @param {number}  props.width
 * @param {number}  props.margin
 * @param {number}  props.xDomain
 */

function get2DXScale(props) {
  const { width, margin, xDomain } = props;
  return scaleLinear(xDomain, [width - margin.right, margin.left]);
}

/***
 * props {height,margin,yDomain}
 */
/***
 * @param {object} props
 * @param {number}  props.height
 * @param {number}  props.margin
 * @param {number}  props.yDomain
 */
function get2DYScale(props, reverse = false) {
  const { height, margin, yDomain } = props;
  return scaleLinear(
    yDomain,
    reverse
      ? [height - margin.bottom, margin.top]
      : [margin.top, height - margin.bottom],
  );
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
