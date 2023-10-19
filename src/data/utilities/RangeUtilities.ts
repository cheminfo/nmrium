import omit from 'lodash/omit';
import { Range, Signal1D } from 'nmr-processing';

import { DATUM_KIND } from '../constants/signalsKinds';

export function getDiaIDs(range: Range): string[] {
  return ([] as string[]).concat(
    range.diaIDs || [],
    range.signals
      ? range.signals.flatMap((_signal) => _signal.diaIDs || [])
      : [],
  );
}

export function getNbAtoms(range: Range, signalIndex?: number): number {
  if (signalIndex === undefined) {
    let sum = 0;
    if (range.signals) {
      for (const signal of range.signals) {
        sum += signal.nbAtoms || 0;
      }
    }
    return sum;
  }

  return range.signals[signalIndex].nbAtoms || 0;
}

export function setNbAtoms(range: Range, signalIndex?: number): void {
  range.nbAtoms = getNbAtoms(range, signalIndex);
  if (range.nbAtoms === 0) {
    delete range.nbAtoms;
  }
}

export function resetDiaIDs(range: Range): void {
  const deletedKeys = ['diaIDs', 'nbAtoms'];
  range = omit(range, deletedKeys) as Range;
  range.signals = range.signals.map((signal) => {
    return omit(signal, deletedKeys) as Signal1D;
  });
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
      resetDiaIDs(range);
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

export function addDefaultSignal(range) {
  range.signals.push({
    multiplicity: 'm',
    kind: 'signal',
    delta: (range.to + range.from) / 2,
  });
}

export function checkRangeKind(range) {
  return range.kind === DATUM_KIND.signal;
}

export function checkSignalKinds(range, kinds) {
  return !range.signals.some(
    (_signal) => _signal.kind === undefined || !kinds.includes(_signal.kind),
  );
}

export function unlinkInAssignmentData(
  assignmentData,
  ranges: Array<Partial<Range>>,
) {
  const ids = ranges.flatMap((range) => {
    if (range.id) {
      return range.id;
    }
    if (range.signals) {
      return range.signals.map((signal) => signal.id);
    }
    return [];
  });

  assignmentData.dispatch({
    type: 'REMOVE',
    payload: { ids, axis: 'x' },
  });
}
