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
  Zone,
} from '../../../data/data2d/Datum2D';
import {
  getPubIntegral,
  unlink,
  unlinkInAssignmentData,
} from '../../../data/utilities/ZoneUtilities';
import Events from '../../utility/Events';
import { State } from '../Reducer';
import get2DRange from '../helper/get2DRange';

// eslint-disable-next-line import/order
import { handleUpdateCorrelations } from './CorrelationsActions';
// import { AnalysisObj } from '../core/Analysis';

import { setDomain } from './DomainActions';

let noiseFactor = 1;

Events.on('noiseFactorChanged', (val) => {
  noiseFactor = val;
});

function add2dZoneHandler(draft: Draft<State>, action) {
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
    const _zone = (draft.data[index] as Datum2D).zones.values[
      zoneIndex
    ] as Zone;
    _zone.signal[rowData.tableMetaInfo.signalIndex].kind = value;
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
    const { zoneData, assignmentData, isOnZoneLevel, signalIndex, axis } =
      action.payload;

    for (let zone of zoneData
      ? [zoneData]
      : (state.data[index] as Datum2D).zones.values) {
      // remove assignments in global state
      const _zoneData = unlink(
        cloneDeep(zone),
        isOnZoneLevel,
        signalIndex,
        axis,
      );
      // remove assignments in assignment hook data
      if (isOnZoneLevel) {
        unlinkInAssignmentData(assignmentData, [{ id: _zoneData.id }], axis);
      } else {
        unlinkInAssignmentData(
          assignmentData,
          [{ id: _zoneData.signal[signalIndex].id }],
          axis,
        );
      }

      const zoneIndex = getZoneIndex(state, index, _zoneData.id);
      (draft.data[index] as Datum2D).zones.values[zoneIndex] = _zoneData;
    }
  }
}

function handleSetDiaIDZone(draft: Draft<State>, action) {
  const state = original(draft) as State;
  if (state.activeSpectrum?.id) {
    const { index } = state.activeSpectrum;
    const { zoneData, diaID, axis, signalIndex } = action.payload;

    const zoneIndex = getZoneIndex(state, index, zoneData.id);
    const _zone = (draft.data[index] as Datum2D).zones.values[
      zoneIndex
    ] as Zone;
    if (signalIndex === undefined) {
      _zone[axis].diaID = diaID;
    } else {
      _zone.signal[signalIndex][axis].diaID = diaID;
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
};
