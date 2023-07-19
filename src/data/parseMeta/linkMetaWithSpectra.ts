import lodashGet from 'lodash/get';
import { Spectrum } from 'nmr-load-save';
import { ParseResult } from 'papaparse';

import { prepareKey } from './prepareKey';

interface CompareResultItem {
  key: string;
  isDuplicated: boolean;
  spectraIDs: string[];
}
type CompareResult = Record<number, CompareResultItem>;

function linkMetaWithSpectra(options: {
  source?: string;
  target?: string;
  autolink?: boolean;
  parseMetaFileResult: ParseResult<any>;
  spectra: Spectrum[];
}) {
  const { autolink = false, parseMetaFileResult, spectra } = options;
  let { source, target } = options;
  const targetValues: Record<string, string[]> = {};

  const {
    data,
    meta: { fields = [] },
  } = parseMetaFileResult;

  if (!autolink) {
    if (target && !lodashGet(spectra[0], target)) {
      throw new TargetPathError(target);
    }

    if (source && !fields.includes(source)) {
      throw new SourcePathError(source);
    }
  }

  if (autolink) {
    for (const sourceField of fields) {
      if (lodashGet(spectra[0], sourceField, null)) {
        source = sourceField;
        target = sourceField;
        break;
      }
    }
  }

  const compareResult: CompareResult = {};
  const matches: Record<string, any> =
    {}; /** where the `key` is the spectra id and the `value` is the meta object  */

  if (source && target) {
    for (const spectrum of spectra) {
      const value = lodashGet(spectrum, target);

      if (['string', 'number'].includes(typeof value)) {
        const val = prepareKey(value);
        if (!targetValues[val]) {
          targetValues[val] = [spectrum.id];
        } else {
          targetValues[val].push(spectrum.id);
        }
      }
    }

    const sourceValues = {};
    let index = 0;
    for (const metaRow of data) {
      const sourceValue = prepareKey(metaRow[source]);
      if (targetValues[sourceValue]) {
        if (!sourceValues[sourceValue]) {
          sourceValues[sourceValue] = [index];
        } else {
          sourceValues[sourceValue].push(index);
        }
      }
      index++;
    }

    for (const key in sourceValues) {
      for (const index of sourceValues[key]) {
        const isDuplicated = sourceValues[key].length > 1;
        compareResult[index] = {
          key,
          isDuplicated,
          spectraIDs: targetValues[key],
        };
        if (!isDuplicated && targetValues[key].length === 1) {
          matches[targetValues[key][0]] = data[index];
        }
      }
    }
  }
  return { matches, compareResult };
}

class AutomaticPathsMatchesError extends Error {
  constructor() {
    super('No matching Field');
    this.name = 'AutomaticPathsMatchesError';
  }
}
class TargetPathError extends Error {
  constructor(fieldPath) {
    super(`Target field path [ ${fieldPath} ] is not exists`);
    this.name = 'TargetPathError';
  }
}
class SourcePathError extends Error {
  constructor(fieldPath) {
    super(`Source field path [ ${fieldPath} ] is not exists`);
    this.name = 'AutomaticPathsMatchesError';
  }
}

export {
  linkMetaWithSpectra,
  AutomaticPathsMatchesError,
  TargetPathError,
  SourcePathError,
};
export type { CompareResultItem, CompareResult };
