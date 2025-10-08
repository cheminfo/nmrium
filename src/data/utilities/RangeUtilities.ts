import type { Range, Signal1D } from '@zakodium/nmr-types';
import omit from 'lodash/omit.js';

import { DATUM_KIND } from '../constants/signalsKinds.js';

function resetDiaIDs(range: Range) {
  const deletedKeys = ['diaIDs', 'nbAtoms'];
  range = omit(range, deletedKeys) as Range;
  range.signals = range.signals.map((signal) => {
    return omit(signal, deletedKeys) as Signal1D;
  });
  return range;
}

/**
 *
 * @param {object} range
 * @param {String('both' | 'range' | 'signal')} unlinkType
 * @param {object} options
 * @param {number} [options.signalIndex]
 * @returns {object}
 */

interface UnlinkOptions {
  unlinkType?: 'both' | 'range' | 'signal';
  signalIndex?: number;
}
export function unlink(range: Range, options: UnlinkOptions = {}): Range {
  const { unlinkType = 'both', signalIndex = -1 } = options;
  const keys = ['diaIDs', 'nbAtoms'];

  switch (unlinkType) {
    case 'both':
      range = resetDiaIDs(range);
      break;
    case 'range':
      range = omit(range, keys) as Range;
      break;
    case 'signal':
      if (signalIndex !== -1) {
        range.signals[signalIndex] = omit(
          range.signals[signalIndex],
          keys,
        ) as Signal1D;
      }
      break;
    default:
      break;
  }
  return range;
}

export function checkRangeKind(range: any) {
  return range.kind === DATUM_KIND.signal;
}
