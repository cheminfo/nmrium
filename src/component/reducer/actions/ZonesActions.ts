import { Draft, original } from 'immer';
import cloneDeep from 'lodash/cloneDeep';

import { Filters } from '../../../data/Filters';
import * as FiltersManager from '../../../data/FiltersManager';
import {
  DatumKind,
  SignalKindsToInclude,
} from '../../../data/constants/SignalsKinds';
import {
  changeZoneSignal,
  Datum2D,
  detectZones,
  detectZonesManual,
  updateShift,
} from '../../../data/data2d/Spectrum2D';
import {
  getPubIntegral,
  unlink,
  unlinkInAssignmentData,
} from '../../../data/utilities/ZoneUtilities';
import { State } from '../Reducer';
import get2DRange from '../helper/get2DRange';

import { handleUpdateCorrelations } from './CorrelationsActions';
import { setDomain } from './DomainActions';

function changeZonesFactorHandler(draft: Draft<State>, action) {
  draft.toolOptions.data.zonesNoiseFactor = action.payload;
}

function add2dZoneHandler(draft: Draft<State>, action) {
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    const drawnZone = get2DRange(draft, action);
    detectZonesManual(draft.data[index], {
      selectedZone: drawnZone,
      thresholdFactor: draft.toolOptions.data.zonesNoiseFactor,
      convolutionByFFT: false,
    });
    handleOnChangeZonesData(draft);
  }
}
function handleAutoZonesDetection(draft: Draft<State>, detectionOptions) {
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;

    const [fromX, toX] = draft.xDomain;
    const [fromY, toY] = draft.yDomain;
    detectionOptions.selectedZone = { fromX, toX, fromY, toY };

    detectZones(draft.data[index], detectionOptions);
    handleOnChangeZonesData(draft);
  }
}

function changeZoneSignalDelta(draft: Draft<State>, action) {
  const { zoneID, signal } = action.payload;
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    const { xShift, yShift } = changeZoneSignal(
      draft.data[index],
      zoneID,
      signal,
    );
    let filters: any = [];
    if (xShift !== 0) {
      filters.push({ name: Filters.shift2DX.id, options: xShift });
    }
    if (yShift !== 0) {
      filters.push({ name: Filters.shift2DY.id, options: yShift });
    }

    FiltersManager.applyFilter(draft.data[index], filters);

    updateShift(draft.data[index] as Datum2D);

    setDomain(draft);
    handleOnChangeZonesData(draft);
  }
}

function getZoneIndex(state, spectrumIndex, zoneID) {
  return state.data[spectrumIndex].zones.values.findIndex(
    (zone) => zone.id === zoneID,
  );
}

function handleChangeZoneSignalKind(draft: Draft<State>, action) {
  const state = original(draft) as State;
  if (state.activeSpectrum?.id) {
    const { index } = state.activeSpectrum;
    const { rowData, value } = action.payload;
    const zoneIndex = getZoneIndex(state, index, rowData.id);
    const _zone = (draft.data[index] as Datum2D).zones.values[zoneIndex];
    _zone.signals[rowData.tableMetaInfo.signalIndex].kind = value;
    _zone.kind = SignalKindsToInclude.includes(value)
      ? DatumKind.signal
      : DatumKind.mixed;
    handleOnChangeZonesData(draft);
  }
}

function handleDeleteZone(draft: Draft<State>, action) {
  const state = original(draft) as State;
  if (state.activeSpectrum?.id) {
    const { index } = state.activeSpectrum;
    const { id, assignmentData } = action.payload;
    if (id) {
      const zone = (draft.data[index] as Datum2D).zones.values.find(
        (zone) => zone.id === id,
      );
      unlinkInAssignmentData(assignmentData, [zone]);
      const zoneIndex = getZoneIndex(state, index, id);
      (draft.data[index] as Datum2D).zones.values.splice(zoneIndex, 1);
    } else {
      unlinkInAssignmentData(
        assignmentData,
        (draft.data[index] as Datum2D).zones.values,
      );
      (draft.data[index] as Datum2D).zones.values = [];
    }
    handleOnChangeZonesData(draft);
  }
}

function handleUnlinkZone(draft: Draft<State>, action) {
  const state = original(draft) as State;
  if (state.activeSpectrum?.id) {
    const { index } = state.activeSpectrum;
    const {
      zoneData = null,
      assignmentData,
      isOnZoneLevel = undefined,
      signalIndex = -1,
      axis = undefined,
    } = action.payload;

    if (zoneData) {
      // remove assignments in global state

      const zoneIndex = getZoneIndex(state, index, zoneData.id);

      const zone = cloneDeep(
        (draft.data[index] as Datum2D).zones.values[zoneIndex],
      );
      const _zoneData = unlink(zone, isOnZoneLevel, signalIndex, axis);

      unlinkInAssignmentData(
        assignmentData,
        [{ id: zoneData.signal[signalIndex].id }],
        axis,
      );
      (draft.data[index] as Datum2D).zones.values[zoneIndex] = _zoneData;
    } else {
      const zones = (draft.data[index] as Datum2D).zones.values.map((zone) => {
        return unlink(zone);
      });
      (draft.data[index] as Datum2D).zones.values = zones;

      unlinkInAssignmentData(assignmentData, zones);
    }
  }
}

function handleSetDiaIDZone(draft: Draft<State>, action) {
  const state = original(draft) as State;
  if (state.activeSpectrum?.id) {
    const { index } = state.activeSpectrum;
    const { zoneData, diaID, axis, signalIndex } = action.payload;

    const zoneIndex = getZoneIndex(state, index, zoneData.id);
    const _zone = (draft.data[index] as Datum2D).zones.values[zoneIndex];
    if (signalIndex === undefined) {
      _zone[axis].diaID = diaID;
    } else {
      _zone.signals[signalIndex][axis].diaID = diaID;
    }
    _zone[axis].pubIntegral = getPubIntegral(_zone, axis);
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
  handleSetDiaIDZone,
  changeZonesFactorHandler,
};
