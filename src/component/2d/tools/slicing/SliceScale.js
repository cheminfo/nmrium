import { extent, scaleLinear } from 'd3';
/***
 * @param {number} width
 * @param {object} margin
 * @param {number} margin.right
 * @param {number} margin.left
 * @param {number[]} x
 * @returns {object={somain.scaleX}}

 */
function getTopXScale(width, margin, x) {
  const xDomain = extent(x);
  const scaleX = scaleLinear(extent(x), [width - margin.right, margin.left]);
  return {
    xDomain,
    scaleX,
  };
}
/***
 * @param {number} width
 * @param {object} margin
 * @param {number} margin.bottom
 * @param {number} margin.top
 * @param {number[]} x
 * @returns {object={somain.scaleX}}
 */
function getLeftXScale(height, margin, x) {
  const xDomain = extent(x);
  const scaleX = scaleLinear(extent(x), [height - margin.bottom, margin.top]);

  return {
    xDomain,
    scaleX,
  };
}

/***
 * @param {number} height
 * @param {number} margin
 * @param {number[]} y
 */
function getYScale(height, y, margin = 10) {
  return scaleLinear(extent(y), [height - margin, margin]);
}

export { getTopXScale, getLeftXScale, getYScale };
