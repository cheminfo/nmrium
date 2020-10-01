import lodash from 'lodash';

import { DELETE_2D_ZONE } from '../../../reducer/types/Types';
import { DatumKind } from '../constants/SignalsKinds';

import { buildID } from './Concatenation';

const getDiaIDs = (zone, axis) => {
  return [].concat(
    zone[axis].diaID || [],
    zone.signal
      ? zone.signal.map((_signal) => _signal[axis].diaID || []).flat()
      : [],
  );
};

const getPubIntegral = (zone, axis) => {
  return getDiaIDs(zone, axis).length;
};

const setPubIntegral = (zone, axis) => {
  zone[axis].pubIntegral = getPubIntegral(zone, axis);
  if (zone[axis].pubIntegral === 0) {
    delete zone[axis].pubIntegral;
  }
};

const resetDiaIDs = (zone, axis) => {
  delete zone[axis].diaID;
  delete zone.pubIntegral;
  zone.signal.forEach((_signal) => {
    delete _signal[axis].diaID;
  });
  return zone;
};

const checkZoneKind = (zone) => {
  return zone.kind === DatumKind.signal;
};

const checkSignalKinds = (zone, kinds) => {
  return !zone.signal.some(
    (_signal) => _signal.kind === undefined || !kinds.includes(_signal.kind),
  );
};

const unlink = (zone, isOnZoneLevel, signalIndex, axis) => {
  const zoneObject = lodash.cloneDeep(zone);

  if (isOnZoneLevel !== undefined && axis !== undefined) {
    if (isOnZoneLevel === true) {
      delete zoneObject[axis].diaID;
    } else if (signalIndex !== undefined) {
      delete zoneObject.signal[signalIndex][axis].diaID;
    }
    setPubIntegral(zoneObject, axis);
  } else if (axis !== undefined) {
    resetDiaIDs(zoneObject, axis);
    setPubIntegral(zoneObject, axis);
  } else {
    ['x', 'y'].forEach((key) => {
      resetDiaIDs(zoneObject, key);
      setPubIntegral(zoneObject, key);
    });
  }
  return zoneObject;
};

const deleteZone = (assignmentData, dispatch, zone) => {
  unlinkInAssignmentData(assignmentData, zone);
  dispatch({ type: DELETE_2D_ZONE, zoneID: zone.id });
};

const _unlinkInAssignmentData = (assignmentData, id, axis) => {
  assignmentData.dispatch({
    type: 'REMOVE_ALL',
    payload: { id, axis },
  });
};

const unlinkInAssignmentData = (
  assignmentData,
  zone,
  isOnZoneLevel,
  signalIndex,
  axis,
) => {
  if (isOnZoneLevel !== undefined && axis !== undefined) {
    _unlinkInAssignmentData(
      assignmentData,
      isOnZoneLevel === true
        ? [zone.id]
        : signalIndex !== undefined
        ? [buildID(zone.id, signalIndex)]
        : [],
      axis,
    );
  } else if (axis !== undefined) {
    _unlinkInAssignmentData(
      assignmentData,
      [zone.id].concat(zone.signal.map((_signal, i) => buildID(zone.id, i))),
      axis,
    );
  } else {
    const id = [zone.id].concat(
      zone.signal.map((_signal, i) => buildID(zone.id, i)),
    );
    _unlinkInAssignmentData(assignmentData, id, 'x');
    _unlinkInAssignmentData(assignmentData, id, 'y');
  }
};

export {
  checkSignalKinds,
  checkZoneKind,
  deleteZone,
  getDiaIDs,
  getPubIntegral,
  resetDiaIDs,
  unlink,
  unlinkInAssignmentData,
};
