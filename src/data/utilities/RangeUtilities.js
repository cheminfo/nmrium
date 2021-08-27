import { DatumKind } from '../constants/SignalsKinds';

export function getDiaIDs(range) {
  return [].concat(
    range.diaIDs || [],
    range.signals
      ? range.signals.map((_signal) => _signal.diaIDs || []).flat()
      : [],
  );
}

export function getPubIntegral(range) {
  return (
    range.nbAtoms ||
    (range.signals
      ? range.signals.reduce((sum, signal) => signal.nbAtoms + sum, 0)
      : 0)
  );
}

export function setPubIntegral(range) {
  range.pubIntegral = getPubIntegral(range);
  if (range.pubIntegral === 0) {
    delete range.pubIntegral;
  }
}

export function resetDiaIDs(range) {
  delete range.diaIDs;
  range.signals.forEach((_signal) => {
    delete _signal.diaIDs;
    delete _signal.nbAtoms;
  });
  delete range.pubIntegral;
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
export function unlink(range, unlinkType = 'both', options = {}) {
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

  setPubIntegral(range);

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

export function unlinkInAssignmentData(assignmentData, ranges) {
  const ids = ranges.reduce((acc, range) => {
    acc.push(range.id);
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
