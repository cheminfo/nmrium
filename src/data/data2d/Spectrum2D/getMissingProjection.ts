import { zoneToX } from 'ml-spectra-processing';

import { UsedColors } from '../../../types/UsedColors';
import { initiateDatum1D } from '../../data1d/Spectrum1D';
import { Datum2D } from '../../types/data2d/Datum2D';

/**
 * calculate the missing projection
 */

export function getMissingProjection(
  datum: Datum2D,
  nucleus: string,
  usedColors: UsedColors,
) {
  let index = datum.info.nucleus.indexOf(nucleus);
  // temporary because nucleus was undefined;
  if (index === -1) index = 0;

  let info = {
    nucleus: datum.info.nucleus[index], // 1H, 13C, 19F, ...
    isFid: false,
    isComplex: false, // if isComplex is true that mean it contains real/ imaginary  x set, if not hid re/im button .
    dimension: 1,
  };

  let from = index === 0 ? datum.data.minX : datum.data.minY;
  let to = index === 0 ? datum.data.maxX : datum.data.maxY;
  let nbPoints = index === 0 ? datum.data.z[0].length : datum.data.z.length;
  let projection = new Float64Array(nbPoints);
  if (index === 1) {
    for (let i = 0; i < datum.data.z.length; i++) {
      for (let j = 0; j < datum.data.z[0].length; j++) {
        projection[i] += datum.data.z[i][j];
      }
    }
  } else {
    for (let i = 0; i < datum.data.z[0].length; i++) {
      for (const z of datum.data.z) {
        projection[i] += z[i];
      }
    }
  }

  let data = {
    x: zoneToX({ from, to }, nbPoints),
    re: projection,
  };
  return initiateDatum1D({ info, data }, usedColors);
}
