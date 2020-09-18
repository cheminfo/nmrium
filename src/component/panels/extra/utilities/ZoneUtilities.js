import lodash from 'lodash';

import { HighlightSignalConcatenation } from '../constants/ConcatenationStrings';

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

const unlinkInAssignmentData = (
  assignmentData,
  zone,
  isOnZoneLevel,
  signalIndex,
  axis,
) => {
  if (isOnZoneLevel !== undefined && axis !== undefined) {
    if (isOnZoneLevel === true) {
      assignmentData.dispatch({
        type: 'REMOVE_ALL',
        payload: {
          id: zone.id,
          axis: axis,
        },
      });
    } else if (signalIndex !== undefined) {
      assignmentData.dispatch({
        type: 'REMOVE_ALL',
        payload: {
          id: `${zone.id}${HighlightSignalConcatenation}${signalIndex}`,
          axis: axis,
        },
      });
    }
  } else if (axis !== undefined) {
    assignmentData.dispatch({
      type: 'REMOVE_ALL',
      payload: {
        id: zone.id,
        axis: axis,
      },
    });
    zone.signal.forEach((_signal, i) => {
      assignmentData.dispatch({
        type: 'REMOVE_ALL',
        payload: {
          id: `${zone.id}${HighlightSignalConcatenation}${i}`,
          axis: axis,
        },
      });
    });
  } else {
    assignmentData.dispatch({
      type: 'REMOVE_ALL',
      payload: {
        id: zone.id,
        axis: 'x',
      },
    });
    zone.signal.forEach((_signal, i) => {
      assignmentData.dispatch({
        type: 'REMOVE_ALL',
        payload: {
          id: `${zone.id}${HighlightSignalConcatenation}${i}`,
          axis: 'x',
        },
      });
    });
    assignmentData.dispatch({
      type: 'REMOVE_ALL',
      payload: {
        id: zone.id,
        axis: 'y',
      },
    });
    zone.signal.forEach((_signal, i) => {
      assignmentData.dispatch({
        type: 'REMOVE_ALL',
        payload: {
          id: `${zone.id}${HighlightSignalConcatenation}${i}`,
          axis: 'y',
        },
      });
    });
  }
};

export {
  checkSignalKinds,
  getDiaIDs,
  getPubIntegral,
  resetDiaIDs,
  unlink,
  unlinkInAssignmentData,
};
