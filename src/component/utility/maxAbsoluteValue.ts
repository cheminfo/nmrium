import { NumberArray } from 'cheminfo-types';
import {
  XGetFromToIndexOptions,
  xCheck,
  xGetFromToIndex,
} from 'ml-spectra-processing';

//This function is an adapted version of the xMaxAbsoluteValue function from ml-spectra-processing. It identifies the maximum absolute value and returns the corresponding maximum value along with its sign
export function maxAbsoluteValue(
  array: NumberArray,
  options: XGetFromToIndexOptions = {},
): number {
  xCheck(array);

  const { fromIndex, toIndex } = xGetFromToIndex(array, options);
  let maxValue = array[fromIndex];
  let sign = 1;

  for (let i = fromIndex + 1; i <= toIndex; i++) {
    if (array[i] >= 0) {
      if (array[i] > maxValue) {
        maxValue = array[i];
        sign = 1;
      }
    } else if (-array[i] > maxValue) {
      maxValue = -array[i];
      sign = Math.sign(array[i]);
    }
  }
  return maxValue * sign;
}
