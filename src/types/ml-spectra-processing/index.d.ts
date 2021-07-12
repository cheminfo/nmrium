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

  /**
   * Returns an object with {fromIndex, toIndex} for a specific from / to
   * @param {array} x
   * @param {object} [options={}]
   * @param {number} [options.from] - First value for xyIntegration in the X scale
   * @param {number} [options.fromIndex=0] - First point for xyIntegration
   * @param {number} [options.to] - Last value for xyIntegration in the X scale
   * @param {number} [options.toIndex=x.length-1] - Last point for xyIntegration
   */

  declare function xGetFromToIndex(
    x: Array<number>,
    options: {
      from?: number;
      fromIndex?: number;
      to?: number;
      toIndex?: number;
      reverse?: boolean;
    },
  ): { fromIndex: number; toIndex: number };

  declare function xyToXYObject(
    data: Array<{ x: Array<number>; y: Array<number> }>,
  ): Array<{ x: number; y: number }>;

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
      to: number;
      fromIndex?: number;
      toIndex?: number;
      reverse?: boolean;
    },
  ): { x: Array<number>; y: Array<number> };

  declare function xyReduce(
    integral: { x: Array<number>; y: Array<number> },
    options: {
      from?: number;
      to?: number;
      nbPoints?: number;
      zones?: Array<{ from; number; to: number }>;
      optimize?: boolean;
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

  /**
import { matrixMinMaxZ } from './matrixMinMaxZ';
import { xHistogram } from '../x/xHistogram';
 * Calculates an histogram of defined number of slots
 * @param {Array<Array<Number>>} [matrix] - matrix [rows][cols].
 * @param {number} [options.nbSlots=256] Number of slots
 * @param {number} [options.min=minValue] Minimum value to calculate used to calculate slot size
 * @param {number} [options.max=maxValue] Maximal value to calculate used to calculate slot size
 * @param {number} [options.logBaseX] We can first apply a log on x axi
 * @param {number} [options.logBaseY] We can apply a log on the resulting histogra
 * @param {number} [options.centerX=true] Center the X value. We will enlarge the first and
 * @return {DataXY} {x,y} of the histogram
 *
 */
  declare function matrixHistogram(
    matrix: Array<Array<number>>,
    options: any = {},
  ): { x: Array<number>; y: Array<number> };

  /**
   * Determine noise level by san plot methodology (https://doi.org/10.1002/mrc.4882)
   * @param {Array} data - real or magnitude spectra data.
   * @param {object} [options = {}]
   * @param {array} [options.mask] - boolean array to filter data, if the i-th element is true then the i-th element of the distribution will be ignored.
   * @param {number} [options.scaleFactor=1] - factor to scale the data input[i]*=scaleFactor.
   * @param {number} [options.cutOff] - percent of positive signal distribution where the noise level will be determined, if it is not defined the program calculate it.
   * @param {number} [options.factorStd=5] - factor times std to determine what will be marked as signals.
   * @param {boolean} [options.refine=true] - if true the noise level will be recalculated get out the signals using factorStd.
   * @param {boolean} [options.fixOffset=true] - If the baseline is correct, the midpoint of distribution should be zero. if true, the distribution will be centered.
   * @param {number} [options.logBaseY=2] - log scale to apply in the intensity axis in order to avoid big numbers.
   */
  declare function xNoiseSanPlot(
    data: any,
    options: {
      mask: any;
      scaleFactor: number;
      cutOff: number;
      factorStd: number;
      refine: boolean;
      fixOffset: boolean;
      logBaseY: number;
    },
  );
}
