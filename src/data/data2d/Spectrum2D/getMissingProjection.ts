import { NmrData2DFt } from 'cheminfo-types';
import { zoneToX } from 'ml-spectra-processing';
import { Info1D, Info2D } from 'nmr-processing';

import { UsedColors } from '../../../types/UsedColors';
import { initiateDatum1D } from '../../data1d/Spectrum1D';

/**
 * calculate the missing projection
 */

export function getProjection(datum: NmrData2DFt['rr'], index: number) {
  const from = index === 0 ? datum.minX : datum.minY;
  const to = index === 0 ? datum.maxX : datum.maxY;
  const nbPoints = index === 0 ? datum.z[0].length : datum.z.length;
  const projection = new Float64Array(nbPoints);
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

  return {
    x: zoneToX({ from, to }, nbPoints),
    re: projection,
  };
}

export function getMissingProjection(
  datum: NmrData2DFt['rr'],
  nucleus: string,
  datumInfo: Info2D,
  usedColors: UsedColors,
) {
  let index = datumInfo.nucleus.indexOf(nucleus);
  // temporary because nucleus was undefined;
  if (index === -1) index = 0;

  const info = {
    ...getInfo(datumInfo, index),
    experiment: '1d',
    pulseSequence: 'projection',
    isFid: false,
    isComplex: false, // if isComplex is true that mean it contains real/ imaginary  x set, if not hid re/im button .
    dimension: 1,
  };

  const data = getProjection(datum, index);

  return initiateDatum1D({ info, data }, { usedColors });
}

function getInfo(info, index) {
  const newInfo: any = {};
  for (const key in info) {
    newInfo[key] = Array.isArray(info[key]) ? info[key][index] : info[key];
  }
  return newInfo as Info1D;
}
