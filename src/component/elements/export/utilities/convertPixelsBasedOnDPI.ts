import { roundNumber } from '../../../utility/roundNumber';

export function convertPixelsBasedOnDPI(
  originalPixelSize: number,
  targetDPI: number,
  originalDPI = 96,
) {
  return roundNumber(originalPixelSize * (targetDPI / originalDPI), 0);
}
