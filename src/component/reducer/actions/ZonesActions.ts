import { Draft, original } from 'immer';
import lodashCloneDeep from 'lodash/cloneDeep';
import { setPathLength } from 'nmr-correlation';

import * as Filters from '../../../data/Filters';
import * as FiltersManager from '../../../data/FiltersManager';
import {
  DatumKind,
  SignalKindsToInclude,
} from '../../../data/constants/SignalsKinds';
import {
  changeZoneSignal,
  detectZones,
  detectZonesManual,
  updateShift,
} from '../../../data/data2d/Spectrum2D';
import { Datum2D } from '../../../data/types/data2d';
import {
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
    const datum = draft.data[index] as Datum2D;

    const zones = detectZonesManual(original(datum), {
      selectedZone: drawnZone,
      thresholdFactor: draft.toolOptions.data.zonesNoiseFactor,
      convolutionByFFT: false,
    });

    datum.zones.values = datum.zones.values.concat(zones);

    handleOnChangeZonesData(draft);
  }
}
function handleAutoZonesDetection(draft: Draft<State>, detectionOptions) {
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;

    const [fromX, toX] = draft.xDomain;
    const [fromY, toY] = draft.yDomain;
    detectionOptions.selectedZone = { fromX, toX, fromY, toY };
    const datum = draft.data[index] as Datum2D;
    const zones = detectZones(original(datum), detectionOptions);
    datum.zones.values = datum.zones.values.concat(zones);
    handleOnChangeZonesData(draft);
  }
}
function handleAutoSpectraZonesDetection(draft: Draft<State>) {
  for (const datum of draft.data) {
    if (datum.info.dimension === 2) {
      const { minX, maxX, minY, maxY } = (datum as Datum2D).data;
      const detectionOptions = {
        selectedZone: { fromX: minX, toX: maxX, fromY: minY, toY: maxY },
        thresholdFactor: 1,
      };

      const zones = detectZones(original(datum), detectionOptions);
      (datum as Datum2D).zones.values = (datum as Datum2D).zones.values.concat(
        zones,
      );

      handleOnChangeZonesData(draft);
    }
  }
}

function changeZoneSignalDelta(draft: Draft<State>, action) {
  const { zoneID, signal } = action.payload;
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    const { xShift, yShift } = changeZoneSignal(
      draft.data[index] as Datum2D,
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
      unlinkInAssignmentData(assignmentData, [zone || {}]);
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

function handleDeleteSignal(draft: Draft<State>, action) {
  const {
    spectrum,
    zone,
    signal,
    assignmentData,
    unlinkSignalInAssignmentData = true,
  } = action.payload;

  if (spectrum && zone) {
    const datum2D = draft.data.find(
      (datum) => datum.id === spectrum.id,
    ) as Datum2D;
    const zoneIndex = datum2D.zones.values.findIndex(
      (_zone) => _zone.id === zone.id,
    );
    const signalIndex = zone.signals.findIndex(
      (_signal) => _signal.id === signal.id,
    );
    // remove assignments for the signal in zone object and global state
    const _zone = unlink(lodashCloneDeep(zone), false, signalIndex, undefined);
    if (unlinkSignalInAssignmentData === true) {
      unlinkInAssignmentData(
        assignmentData,
        [{ signals: [signal] }],
        undefined,
      );
    }
    _zone.signals.splice(signalIndex, 1);
    datum2D.zones.values[zoneIndex] = _zone;
    // if no signals are existing in a zone anymore then delete this zone
    if (_zone.signals.length === 0) {
      unlinkInAssignmentData(assignmentData, [_zone]);
      datum2D.zones.values.splice(zoneIndex, 1);
    }

    handleOnChangeZonesData(draft);
  }
}

function handleSetSignalPathLength(draft: Draft<State>, action) {
  const { spectrum, zone, signal, pathLength } = action.payload;
  if (spectrum && zone) {
    const datum2D = draft.data.find(
      (datum) => datum.id === spectrum.id,
    ) as Datum2D;
    const zoneIndex = datum2D.zones.values.findIndex(
      (_zone) => _zone.id === zone.id,
    );
    const signalIndex = zone.signals.findIndex(
      (_signal) => _signal.id === signal.id,
    );
    const _zone = unlink(lodashCloneDeep(zone), false, signalIndex, undefined);
    _zone.signals[signalIndex].pathLength = pathLength;
    datum2D.zones.values[zoneIndex] = _zone;

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

      const zone = lodashCloneDeep(
        (draft.data[index] as Datum2D).zones.values[zoneIndex],
      );
      const _zoneData = unlink(zone, isOnZoneLevel, signalIndex, axis);

      unlinkInAssignmentData(
        assignmentData,
        [{ id: zoneData.signals[signalIndex].id }],
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
    const { zoneData, diaIDs, axis, signalIndex, nbAtoms } = action.payload;
    const getNbAtoms = (input, current = 0) => input + current;
    const zoneIndex = getZoneIndex(state, index, zoneData.id);
    const _zone = (draft.data[index] as Datum2D).zones.values[zoneIndex];
    if (signalIndex === undefined) {
      _zone[axis].diaIDs = diaIDs;
      _zone[axis].nbAtoms = getNbAtoms(nbAtoms, _zone[axis].nbAtoms);
    } else {
      _zone.signals[signalIndex][axis].diaIDs = diaIDs;
      _zone.signals[signalIndex][axis].nbAtoms = getNbAtoms(
        nbAtoms,
        _zone.signals[signalIndex][axis].nbAtoms,
      );
    }
    // _zone[axis].nbAtoms = getNbAtoms(_zone, axis);
  }
}

function handleSaveEditedZone(draft: Draft<State>, action) {
  const state = original(draft) as State;
  if (state.activeSpectrum?.id) {
    const { index } = state.activeSpectrum;
    const { editedRowData } = action.payload;

    delete editedRowData.tableMetaInfo;

    const zoneIndex = getZoneIndex(state, index, editedRowData.id);
    (draft.data[index] as Datum2D).zones.values[zoneIndex] = editedRowData;

    if (editedRowData.signals) {
      editedRowData.signals.forEach((signal) => {
        setPathLength(draft.correlations.values, signal.id, signal.pathLength);
      });
    }

    handleOnChangeZonesData(draft);
  }
}

function handleOnChangeZonesData(draft) {
  handleUpdateCorrelations(draft);
}

export {
  add2dZoneHandler,
  handleAutoZonesDetection,
  handleDeleteSignal,
  handleDeleteZone,
  changeZoneSignalDelta,
  handleChangeZoneSignalKind,
  handleUnlinkZone,
  handleSaveEditedZone,
  handleSetDiaIDZone,
  handleSetSignalPathLength,
  changeZonesFactorHandler,
  handleAutoSpectraZonesDetection,
};
