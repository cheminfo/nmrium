import lodash from 'lodash';

import { DELETE_RANGE } from '../../component/reducer/types/Types';
import { DatumKind } from '../constants/SignalsKinds';

const getDiaIDs = (range) => {
  return [].concat(
    range.diaID || [],
    range.signal
      ? range.signal.map((_signal) => _signal.diaID || []).flat()
      : [],
  );
};

const getPubIntegral = (range) => {
  return getDiaIDs(range).length;
};

const setPubIntegral = (range) => {
  range.pubIntegral = getPubIntegral(range);
  if (range.pubIntegral === 0) {
    delete range.pubIntegral;
  }
};

const resetDiaIDs = (range) => {
  delete range.diaID;
  range.signal.forEach((_signal) => {
    delete _signal.diaID;
  });
  delete range.pubIntegral;
};

const unlink = (range, isOnRangeLevel, signalIndex) => {
  const rangeObject = lodash.cloneDeep(range);

  if (isOnRangeLevel !== undefined) {
    if (isOnRangeLevel === true) {
      delete rangeObject.diaID;
    } else if (signalIndex !== undefined) {
      delete rangeObject.signal[signalIndex].diaID;
    }
  } else {
    resetDiaIDs(rangeObject);
  }
  setPubIntegral(rangeObject);
  return rangeObject;
};

const addDefaultSignal = (range) => {
  range.signal.push({
    multiplicity: 'm',
    kind: 'signal',
    delta: (range.to + range.from) / 2,
  });
};

const checkRangeKind = (range) => {
  return range.kind === DatumKind.signal;
};

const checkSignalKinds = (range, kinds) => {
  return !range.signal.some(
    (_signal) => _signal.kind === undefined || !kinds.includes(_signal.kind),
  );
};

const deleteRange = (assignmentData, dispatch, range) => {
  unlinkInAssignmentData(assignmentData, range);
  dispatch({ type: DELETE_RANGE, rangeID: range.id });
};

const _unlinkInAssignmentData = (assignmentData, id) => {
  assignmentData.dispatch({
    type: 'REMOVE_ALL',
    payload: { id, axis: 'x' },
  });
};

const unlinkInAssignmentData = (
  assignmentData,
  range,
  isOnRangeLevel,
  signalIndex,
) => {
  let id = [];
  if (isOnRangeLevel !== undefined) {
    id =
      isOnRangeLevel === true
        ? [range.id]
        : signalIndex !== undefined
        ? [range.signal[signalIndex].id]
        : [];
  } else {
    id = [range.id].concat(range.signal.map((signal) => signal.id));
  }
  _unlinkInAssignmentData(assignmentData, id);
};

// const initAssignmentData = (range, assignmentData) => {
//   assignmentData.dispatch({
//     type: 'DELETE_RECORD',
//     payload: { id: range.id },
//   });
//   (range.diaID || []).forEach((_diaID) =>
//     assignmentData.dispatch({
//       type: 'ADD',
//       payload: { id: [range.id, _diaID], axis: 'x' },
//     }),
//   );
//   range.signal.forEach((signal) =>
//     (signal.diaID || []).forEach((_diaID) =>
//       assignmentData.dispatch({
//         type: 'ADD',
//         payload: { id: [signal.id, _diaID], axis: 'x' },
//       }),
//     ),
//   );
// };

export {
  addDefaultSignal,
  checkRangeKind,
  checkSignalKinds,
  deleteRange,
  getDiaIDs,
  getPubIntegral,
  // initAssignmentData,
  resetDiaIDs,
  unlink,
  unlinkInAssignmentData,
};
