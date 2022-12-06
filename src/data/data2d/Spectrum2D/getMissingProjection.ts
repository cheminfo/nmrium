import { zoneToX } from 'ml-spectra-processing';

import { UsedColors } from '../../../types/UsedColors';
import { initiateDatum1D } from '../../data1d/Spectrum1D';
import { Info2D } from '../../types/data2d';
import { MinMaxContent } from '../../types/data2d/Data2D';

/**
 * calculate the missing projection
 */

export function getMissingProjection(
  datum: MinMaxContent,
  nucleus: string,
  datumInfo: Info2D,
  usedColors: UsedColors,
) {
  let index = datumInfo.nucleus.indexOf(nucleus);
  // temporary because nucleus was undefined;
  if (index === -1) index = 0;

  let info = {
    nucleus: datumInfo.nucleus[index], // 1H, 13C, 19F, ...
    isFid: false,
    isComplex: false, // if isComplex is true that mean it contains real/ imaginary  x set, if not hid re/im button .
    dimension: 1,
  };

  let from = index === 0 ? datum.minX : datum.minY;
  let to = index === 0 ? datum.maxX : datum.maxY;
  let nbPoints = index === 0 ? datum.z[0].length : datum.z.length;
  let projection = new Float64Array(nbPoints);
  if (index === 1) {
    for (let i = 0; i < datum.z.length; i++) {
      for (let j = 0; j < datum.z[0].length; j++) {
        projection[i] += datum.z[i][j];
      }
    }
  } else {
    for (let i = 0; i < datum.z[0].length; i++) {
      for (const z of datum.z) {
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
