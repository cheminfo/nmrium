import type { Spectrum1D, SpectrumOneDimensionColor } from 'nmr-load-save';
import { Filters1DManager } from 'nmr-processing';

import type { UsedColors } from '../../../types/UsedColors.js';
import { initiateFilters } from '../../initiateFilters.js';
import type { StateMoleculeExtended } from '../../molecules/Molecule.js';

import { initSumOptions } from './SumManager.js';
import { convertDataToFloat64Array } from './convertDataToFloat64Array.js';
import { get1DColor } from './get1DColor.js';
import { initiateIntegrals } from './integrals/initiateIntegrals.js';
import { initiatePeaks } from './peaks/initiatePeaks.js';
import { initiateRanges } from './ranges/initiateRanges.js';

interface InitiateDatum1DOptions {
  usedColors?: UsedColors;
  molecules?: StateMoleculeExtended[];
  colors?: SpectrumOneDimensionColor[];
}

export function initiateDatum1D(
  spectrum: any,
  options: InitiateDatum1DOptions = {},
): Spectrum1D {
  const { usedColors, colors, molecules = [] } = options;

  const { integrals, ranges, ...restSpectrum } = spectrum;
  const spectrumObj: Spectrum1D = { ...restSpectrum };
  spectrumObj.id = spectrum.id || crypto.randomUUID();

  spectrumObj.display = {
    isVisible: true,
    isRealSpectrumVisible: true,
    ...spectrum.display,
    ...get1DColor(spectrum, { usedColors, colors }),
  };

  spectrumObj.info = {
    nucleus: '1H', // 1H, 13C, 19F, ...
    isFid: false,
    isComplex: false, // if isComplex is true that mean it contains real/ imaginary  x set, if not hid re/im button .
    dimension: 1,
    ...spectrum.info,
  };

  spectrumObj.originalInfo = spectrumObj.info;

  spectrumObj.meta = { ...spectrum.meta };

  spectrumObj.customInfo = { ...spectrum.customInfo };

  spectrumObj.data = convertDataToFloat64Array(spectrum.data);

  spectrumObj.originalData = spectrumObj.data;

  spectrumObj.filters = initiateFilters(spectrum?.filters); //array of object {name: "FilterName", options: FilterOptions = {value | object} }

  const { nucleus } = spectrumObj.info;

  spectrumObj.peaks = initiatePeaks(spectrum, spectrumObj);

  // array of object {index: xIndex, xShift}
  // in case the peak does not exactly correspond to the point value
  // we can think about a second attributed `xShift`
  const integralsOptions = initSumOptions(integrals?.options || {}, {
    nucleus,
    molecules,
  });
  spectrumObj.integrals = initiateIntegrals(
    spectrum,
    spectrumObj,
    integralsOptions,
  ); // array of object (from: xIndex, to: xIndex)

  const rangesOptions = initSumOptions(ranges?.options || {}, {
    nucleus,
    molecules,
  });
  spectrumObj.ranges = initiateRanges(spectrum, spectrumObj, rangesOptions);

  //reapply filters after load the original data
  Filters1DManager.reapplyFilters(spectrumObj);

  return spectrumObj;
}
