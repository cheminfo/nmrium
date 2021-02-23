import { original } from 'immer';

import {
  DatumKind,
  SignalKindsToInclude,
} from '../../../data/constants/SignalsKinds';
import {
  changeZoneSignal,
  detectZones,
  detectZonesManual,
} from '../../../data/data2d/Datum2D';
import {
  unlink,
  unlinkInAssignmentData,
} from '../../../data/utilities/ZoneUtilities';
import Events from '../../utility/Events';
import get2DRange from '../helper/get2DRange';

// eslint-disable-next-line import/order
import { handleUpdateCorrelations } from './CorrelationsActions';
// import { AnalysisObj } from '../core/Analysis';

import { setDomain } from './DomainActions';

let noiseFactor = 1;

Events.on('noiseFactorChanged', (val) => {
  noiseFactor = val;
});

function add2dZoneHandler(draft, action) {
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    const drawnZone = get2DRange(draft, action);
    detectZonesManual(draft.data[index], {
      selectedZone: drawnZone,
      thresholdFactor: noiseFactor,
      convolutionByFFT: false,
    });
    handleOnChangeZonesData(draft);
  }
}

function handleAutoZonesDetection(draft, detectionOptions) {
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    detectZones(draft.data[index], detectionOptions);
    handleOnChangeZonesData(draft);
  }
}

function changeZoneSignalDelta(draft, action) {
  const { zoneID, signal } = action.payload;
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    changeZoneSignal(draft.data[index], zoneID, signal);
    setDomain(draft);
    handleOnChangeZonesData(draft);
  }
}

function getZoneIndex(state, spectrumIndex, zoneID) {
  return state.data[spectrumIndex].zones.values.findIndex(
    (zone) => zone.id === zoneID,
  );
}

function handleChangeZoneSignalKind(draft, action) {
  const state = original(draft);
  if (state.activeSpectrum?.id) {
    const { index } = state.activeSpectrum;
    const { rowData, value } = action.payload;
    const zoneIndex = getZoneIndex(state, index, rowData.id);
    const _zone = draft.data[index].zones.values[zoneIndex];
    _zone.signal[rowData.tableMetaInfo.signalIndex].kind = value;
    _zone.kind = SignalKindsToInclude.includes(value)
      ? DatumKind.signal
      : DatumKind.mixed;
    handleOnChangeZonesData(draft);
  }
}

function handleDeleteZone(draft, action) {
  const state = original(draft);
  if (state.activeSpectrum?.id) {
    const { index } = state.activeSpectrum;
    const { zoneData, assignmentData } = action.payload;
    if (zoneData === undefined) {
      draft.data[index].zones.values.forEach((zone) =>
        unlinkInAssignmentData(assignmentData, zone),
      );
      draft.data[index].zones.values = [];
    } else {
      unlinkInAssignmentData(assignmentData, zoneData);
      const zoneIndex = getZoneIndex(state, index, zoneData.id);
      draft.data[index].zones.values.splice(zoneIndex, 1);
    }
    handleOnChangeZonesData(draft);
  }
}

function handleUnlinkZone(draft, action) {
  const state = original(draft);
  if (state.activeSpectrum?.id) {
    const { index } = state.activeSpectrum;
    const {
      zoneData,
      assignmentData,
      isOnZoneLevel,
      signalIndex,
      axis,
    } = action.payload;
    // remove assignments in global state
    const _zoneData = unlink(zoneData, isOnZoneLevel, signalIndex, axis);
    // remove assignments in assignment hook data
    unlinkInAssignmentData(
      assignmentData,
      _zoneData,
      isOnZoneLevel,
      signalIndex,
      axis,
    );

    const zoneIndex = getZoneIndex(state, index, _zoneData.id);
    draft.data[index].zones.values[zoneIndex] = _zoneData;
  }
}

function handleOnChangeZonesData(draft) {
  handleUpdateCorrelations(draft);
}

export {
  add2dZoneHandler,
  handleAutoZonesDetection,
  handleDeleteZone,
  changeZoneSignalDelta,
  handleChangeZoneSignalKind,
  handleUnlinkZone,
};
