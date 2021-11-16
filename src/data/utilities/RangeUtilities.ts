import { DatumKind } from '../constants/SignalsKinds';
import { Range } from '../types/data1d';

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
    return range.signals
      ? range.signals.reduce(
          (sum, signal) => (signal.nbAtoms ? signal.nbAtoms + sum : sum),
          0,
        )
      : 0;
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
  delete range.diaIDs;
  delete range.nbAtoms;
  range.signals.forEach((_signal) => {
    delete _signal.diaIDs;
    delete _signal.nbAtoms;
  });
  delete range.nbAtoms;
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
  const ids = ranges.reduce((acc: string[], range) => {
    if (range.id) {
      acc.push(range.id);
    }
    if (range.signals) {
      acc = acc.concat(range.signals.map((signal) => signal.id, []));
    }
    return acc;
  }, []);
  assignmentData.dispatch({
    type: 'REMOVE_ALL',
    payload: { id: ids, axis: 'x' },
  });
}
