declare module 'ml-spectra-processing' {
  /**
   * Returns the closest index of a `target` in an ordered array
   * @param {array<Number>} array
   * @param {number} target
   * @return {number} closest index
   */
  declare function xFindClosestIndex(
    array: Array<number>,
    target: number,
  ): number;

  declare function zoneToX(
    zone: { from: number; to: number },
    size: number,
  ): Array<any>;

  /**
   * Generate a X / Y of the xyIntegral
   * @param {DataXY} [data={}] - Object that contains property x (an ordered increasing array) and y (an array)
   * @param {object} [options={}]
   * @param {number} [options.from] - First value for xyIntegration in the X scale
   * @param {number} [options.fromIndex=0] - First point for xyIntegration
   * @param {number} [options.to] - Last value for xyIntegration in the X scale
   * @param {number} [options.toIndex=x.length-1] - Last point for xyIntegration
   * @param {boolean} [options.reverse=false] - Integrate from the larger value to the smallest value
   * @return {{x:[],y:[]}} An object with the xyIntegration function
   */

  declare function xyIntegral(
    data: { x: Array<any>; y: Array<any> },
    options: {
      from: number;
      fromIndex?: number;
      to: number;
      toIndex?: number;
      reverse?: boolean;
    },
  ): { x: Array<number>; y: Array<number> };

  /**
   * Calculate integration
   * @param {DataXY} [data={}] - Object that contains property x (an ordered increasing array) and y (an array)
   * @param {object} [options={}]
   * @param {number} [options.from] - First value for xyIntegration in the X scale
   * @param {number} [options.fromIndex=0] - First point for xyIntegration
   * @param {number} [options.to] - Last value for xyIntegration in the X scale
   * @param {number} [options.toIndex=x.length-1] - Last point for xyIntegration
   * @return {number} xyIntegration value on the specified range
   */
  declare function xyIntegration(
    data: { x: Array<any>; y: Array<any> },
    options: {
      from: number;
      fromIndex?: number;
      to: number;
      toIndex?: number;
      reverse?: boolean;
    },
  ): number;

  /**
   * Finds the max y value in a range and return a {x,y} point
   * @param {DataXY} [data={}] - Object that contains property x (an ordered increasing array) and y (an array)
   * @param {object} [options={}]
   * @param {number} [options.from] - First value for xyIntegration in the X scale
   * @param {number} [options.fromIndex=0] - First point for xyIntegration
   * @param {number} [options.to] - Last value for xyIntegration in the X scale
   * @param {number} [options.toIndex=x.length-1] - Last point for xyIntegration
   * @return {object}
   */
  declare function xyMinYPoint(
    data: { x: Array<any>; y: Array<any> },
    options: { from: number; fromIndex?: number; to: number; toIndex?: number },
  ): { x: number; y: number; index: number };

  /**
   * Finds the max y value in a range and return a {x,y} point
   * @param {DataXY} [data={}] - Object that contains property x (an ordered increasing array) and y (an array)
   * @param {object} [options={}]
   * @param {number} [options.from] - First value for xyIntegration in the X scale
   * @param {number} [options.fromIndex=0] - First point for xyIntegration
   * @param {number} [options.to] - Last value for xyIntegration in the X scale
   * @param {number} [options.toIndex=x.length-1] - Last point for xyIntegration
   * @return {object}
   */
  declare function xyMaxYPoint(
    data: { x: Array<any>; y: Array<any> },
    options: { from: number; fromIndex?: number; to: number; toIndex?: number },
  ): { x: number; y: number; index: number };
}
