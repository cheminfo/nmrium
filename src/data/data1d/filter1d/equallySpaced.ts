import equallySpaced from 'ml-array-xy-equally-spaced';
import { Spectrum1D } from 'nmr-load-save';

export const id = 'equallySpaced';
export const name = 'Equally spaced';

/**
 * Equally Spaced
 * **
 * Function that returns a Number array of equally spaced numberOfPoints
 * containing a representation of intensities of the spectra arguments x
 * and y.
 *
 * The options parameter contains an object in the following form:
 * from: starting point
 * to: last point
 * numberOfPoints: number of points between from and to
 * variant: "slot" or "smooth" - smooth is the default option
 *
 * The slot variant consist that each point in the new array is calculated
 * averaging the existing points between the slot that belongs to the current
 * value. The smooth variant is the same but takes the integral of the range
 * of the slot and divide by the step size between two points in the new array.
 *
 * @param {Spectrum1D} spectrum
 * @param {Object} options.from
 * @param {number} options.to
 * @param {number} options.numberOfPoints
 * @param {Array<{from:number;to:number}>} options.exclusions
 */

export function apply(spectrum: Spectrum1D, options: any = {}) {
  if (!isApplicable(spectrum)) {
    throw new Error('Equally Spaced is not applicable on this data');
  }
  const { from, to, numberOfPoints, exclusions } = options;
  const { x, re, im } = spectrum.data;
  const XREdata = equallySpaced(
    { x, y: re },
    { from, to, numberOfPoints, exclusions },
  );

  spectrum.data.x = XREdata.x;
  spectrum.data.re = XREdata.y;
  if (im) {
    const XIMdata = equallySpaced(
      { x, y: re },
      { from, to, numberOfPoints, exclusions },
    );
    spectrum.data.im = XIMdata.y;
  }
}

export function isApplicable(spectrum: Spectrum1D) {
  if (spectrum.info.isComplex && !spectrum.info.isFid) return true;
  return false;
}

export function reduce() {
  return {
    once: false,
    reduce: null,
  };
}
