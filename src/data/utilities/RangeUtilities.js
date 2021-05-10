import { DatumKind } from '../constants/SignalsKinds';

export function getDiaIDs(range) {
  return [].concat(
    range.diaID || [],
    range.signal
      ? range.signal.map((_signal) => _signal.diaID || []).flat()
      : [],
  );
}

export function getPubIntegral(range) {
  return getDiaIDs(range).length;
}

export function setPubIntegral(range) {
  range.pubIntegral = getPubIntegral(range);
  if (range.pubIntegral === 0) {
    delete range.pubIntegral;
  }
}

export function resetDiaIDs(range) {
  delete range.diaID;
  range.signal.forEach((_signal) => {
    delete _signal.diaID;
  });
  delete range.pubIntegral;
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
      delete range.diaID;

      break;
    case 'signal':
      delete range.signal[options.signalIndex].diaID;

      break;

    default:
      break;
  }

  setPubIntegral(range);

  return range;
}

export function addDefaultSignal(range) {
  range.signal.push({
    multiplicity: 'm',
    kind: 'signal',
    delta: (range.to + range.from) / 2,
  });
}

export function checkRangeKind(range) {
  return range.kind === DatumKind.signal;
}

export function checkSignalKinds(range, kinds) {
  return !range.signal.some(
    (_signal) => _signal.kind === undefined || !kinds.includes(_signal.kind),
  );
}

export function unlinkInAssignmentData(assignmentData, ranges) {
  const ids = ranges.reduce((acc, range) => {
    acc.push(range.id);
    if (range.signal) {
      acc = acc.concat(range.signal.map((signal) => signal.id, []));
    }
    return acc;
  }, []);
  assignmentData.dispatch({
    type: 'REMOVE_ALL',
    payload: { id: ids, axis: 'x' },
  });
}
