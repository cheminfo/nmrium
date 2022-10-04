import omit from 'lodash/omit';

import { DatumKind } from '../constants/SignalsKinds';
import { Range } from '../types/data1d';
import { Signal1D } from '../types/data1d/Signal1D';

export function getDiaIDs(range: Range): string[] {
  return ([] as string[]).concat(
    range.diaIDs || [],
    range.signals
      ? range.signals.map((_signal) => _signal.diaIDs || []).flat()
      : [],
  );
}

export function getNbAtoms(range: Range, signalIndex?: number): number {
  if (signalIndex === undefined) {
    let sum = 0;
    if (range.signals) {
      range.signals.forEach(
        (signal) => (signal.nbAtoms ? signal.nbAtoms + sum : sum),
        0,
      );
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
export function unlink(
  range: Range,
  unlinkType = 'both',
  options: any = {},
): Range {
  switch (unlinkType) {
    case 'both':
      resetDiaIDs(range);
      break;
    case 'range':
      delete range.diaIDs;
      delete range.nbAtoms;
      break;
    case 'signal':
      delete range.signals[options.signalIndex].diaIDs;
      delete range.signals[options.signalIndex].nbAtoms;
      break;
    default:
      break;
  }

  setNbAtoms(range);

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
  return range.kind === DatumKind.signal;
}

export function checkSignalKinds(range, kinds) {
  return !range.signals.some(
    (_signal) => _signal.kind === undefined || !kinds.includes(_signal.kind),
  );
}

export function unlinkInAssignmentData(
  assignmentData,
  ranges: Partial<Range>[],
) {
  let ids: string[] = [];
  ranges.forEach((range) => {
    if (range.id) {
      ids.push(range.id);
    }
    if (range.signals) {
      ids = ids.concat(range.signals.map((signal) => signal.id, []));
    }
  });
  assignmentData.dispatch({
    type: 'REMOVE_ALL',
    payload: { id: ids, axis: 'x' },
  });
}
