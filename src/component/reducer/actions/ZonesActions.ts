import { FromTo, NmrData2DFt } from 'cheminfo-types';
import { Draft, original } from 'immer';
import lodashCloneDeep from 'lodash/cloneDeep';
import { setPathLength } from 'nmr-correlation';
import type { Spectrum, Spectrum2D, ZonesViewState } from 'nmr-load-save';
import type { Signal2D, Zone } from 'nmr-processing';
import { Filters, FiltersManager } from 'nmr-processing';

import {
  DATUM_KIND,
  SIGNAL_INLCUDED_KINDS,
} from '../../../data/constants/signalsKinds';
import {
  changeZoneSignal,
  detectZones,
  detectZonesManual,
} from '../../../data/data2d/Spectrum2D';
import { DetectionZonesOptions } from '../../../data/data2d/Spectrum2D/zones/getDetectionZones';
import {
  unlink,
  unlinkInAssignmentData,
} from '../../../data/utilities/ZoneUtilities';
import { isNumber } from '../../../data/utilities/isNumber';
import { AssignmentContext, Axis } from '../../assignment/AssignmentsContext';
import { defaultZonesViewState } from '../../hooks/useActiveSpectrumZonesViewState';
import { ZoneData } from '../../panels/ZonesPanel/hooks/useMapZones';
import { FilterType } from '../../utility/filterType';
import { State } from '../Reducer';
import get2DRange, { ZoneBoundary } from '../helper/get2DRange';
import { getActiveSpectrum } from '../helper/getActiveSpectrum';
import { ActionType } from '../types/ActionType';

import { handleUpdateCorrelations } from './CorrelationsActions';
import { setDomain } from './DomainActions';

interface DeleteSignal2DProps {
  spectrum: Spectrum;
  zone: Zone;
  signal: Signal2D;
  assignmentData: AssignmentContext;
}

type ChangeZonesFactorAction = ActionType<
  'CHANGE_ZONES_NOISE_FACTOR',
  { zonesNoiseFactor: number }
>;
type Add2dZoneAction = ActionType<'ADD_2D_ZONE', ZoneBoundary>;

type AutoZonesDetectionAction = ActionType<
  'AUTO_ZONES_DETECTION',
  { zonesNoiseFactor: number }
>;
type ChangeZoneSignalDeltaAction = ActionType<
  'CHANGE_ZONE_SIGNAL_VALUE',
  { zoneId: string; signal: { id?: string; deltaX?: number; deltaY?: number } }
>;
type ChangeZoneSignalKindAction = ActionType<
  'CHANGE_ZONE_SIGNAL_KIND',
  { zoneData: ZoneData; kind: string }
>;
type DeleteZoneAction = ActionType<
  'DELETE_2D_ZONE',
  { id?: string; assignmentData: AssignmentContext }
>;
type DeleteSignal2DAction = ActionType<'DELETE_2D_SIGNAL', DeleteSignal2DProps>;
type SetSignalPathLengthAction = ActionType<
  'SET_2D_SIGNAL_PATH_LENGTH',
  {
    spectrum: Spectrum2D;
    zone: Zone;
    signal: Signal2D;
    pathLength: number | FromTo | undefined;
  }
>;

type SetZoneDiaIDAction = ActionType<
  'SET_ZONE_DIAID',
  {
    zone: Zone;
    axis?: Axis;
    signalIndex?: number;
  } & Pick<Zone['x'], 'diaIDs' | 'nbAtoms'>
>;
type SaveEditedZoneAction = ActionType<
  'SAVE_EDITED_ZONE',
  {
    zone: ZoneData;
  }
>;

interface UnlinkZoneProps {
  zone?: ZoneData;
  assignmentData: AssignmentContext;
  isOnZoneLevel?: boolean;
  signalIndex?: number;
  axis?: Axis;
}

type UnlinkZoneAction = ActionType<'UNLINK_ZONE', UnlinkZoneProps>;

type ToggleZonesViewAction = ActionType<
  'TOGGLE_ZONES_VIEW_PROPERTY',
  {
    key: keyof FilterType<ZonesViewState, boolean>;
  }
>;

export type ZonesActions =
  | AutoZonesDetectionAction
  | ChangeZonesFactorAction
  | Add2dZoneAction
  | ChangeZoneSignalDeltaAction
  | ChangeZoneSignalKindAction
  | DeleteZoneAction
  | DeleteSignal2DAction
  | SetSignalPathLengthAction
  | SetZoneDiaIDAction
  | SaveEditedZoneAction
  | UnlinkZoneAction
  | ToggleZonesViewAction
  | ActionType<'AUTO_ZONES_SPECTRA_PICKING'>;

//action
function handleChangeZonesFactor(
  draft: Draft<State>,
  action: ChangeZonesFactorAction,
) {
  draft.toolOptions.data.zonesNoiseFactor = action.payload.zonesNoiseFactor;
}

//action
function handleAdd2dZone(draft: Draft<State>, action: Add2dZoneAction) {
  const activeSpectrum = getActiveSpectrum(draft);

  if (activeSpectrum?.id) {
    const { index } = activeSpectrum;
    const drawnZone = get2DRange(draft, action.payload);
    const datum = draft.data[index] as Spectrum2D;

    const zones = detectZonesManual(original(datum), {
      selectedZone: drawnZone,
      thresholdFactor: draft.toolOptions.data.zonesNoiseFactor,
      convolutionByFFT: false,
    });

    datum.zones.values = datum.zones.values.concat(zones);

    handleUpdateCorrelations(draft);
  }
}

//action
function handleAutoZonesDetection(
  draft: Draft<State>,
  action: AutoZonesDetectionAction,
) {
  const activeSpectrum = getActiveSpectrum(draft);

  if (activeSpectrum?.id) {
    const { index } = activeSpectrum;
    const { zonesNoiseFactor: thresholdFactor } = action.payload;
    const [fromX, toX] = draft.xDomain;
    const [fromY, toY] = draft.yDomain;
    const detectionOptions: DetectionZonesOptions = {
      selectedZone: { fromX, toX, fromY, toY },
      thresholdFactor,
    };
    const datum = draft.data[index] as Spectrum2D;
    const zones = detectZones(original(datum), detectionOptions);
    datum.zones.values = datum.zones.values.concat(zones);
    handleUpdateCorrelations(draft);
  }
}

//action
function handleAutoSpectraZonesDetection(draft: Draft<State>) {
  for (const datum of draft.data) {
    const { info, data } = datum;
    if (info.dimension === 2 && info.isFt) {
      const { minX, maxX, minY, maxY } = (data as NmrData2DFt).rr;
      const detectionOptions = {
        selectedZone: { fromX: minX, toX: maxX, fromY: minY, toY: maxY },
        thresholdFactor: 1,
      };

      const zones = detectZones(original(datum), detectionOptions);
      (datum as Spectrum2D).zones.values = (
        datum as Spectrum2D
      ).zones.values.concat(zones);

      handleUpdateCorrelations(draft);
    }
  }
}

//action
function handleChangeZoneSignalDelta(
  draft: Draft<State>,
  action: ChangeZoneSignalDeltaAction,
) {
  const { zoneId, signal } = action.payload;

  const activeSpectrum = getActiveSpectrum(draft);

  if (activeSpectrum?.id) {
    const { index } = activeSpectrum;
    const { xShift, yShift } = changeZoneSignal(
      draft.data[index] as Spectrum2D,
      zoneId,
      signal,
    );
    const filters: any = [];
    if (xShift !== 0) {
      filters.push({ name: Filters.shift2DX.id, value: { shift: xShift } });
    }
    if (yShift !== 0) {
      filters.push({ name: Filters.shift2DY.id, value: { shift: yShift } });
    }

    FiltersManager.applyFilter(draft.data[index], filters);

    setDomain(draft);
    handleUpdateCorrelations(draft);
  }
}

function getZoneIndex(state: State, spectrumIndex: number, zoneId: string) {
  return (state.data[spectrumIndex] as Spectrum2D).zones.values.findIndex(
    (zone) => zone.id === zoneId,
  );
}

//action
function handleChangeZoneSignalKind(
  draft: Draft<State>,
  action: ChangeZoneSignalKindAction,
) {
  const state = original(draft) as State;

  const activeSpectrum = getActiveSpectrum(state);

  if (activeSpectrum?.id) {
    const { index } = activeSpectrum;
    const { zoneData, kind } = action.payload;
    const zoneIndex = getZoneIndex(state, index, zoneData.id);
    const _zone = (draft.data[index] as Spectrum2D).zones.values[zoneIndex];
    _zone.signals[zoneData.tableMetaInfo.signalIndex].kind = kind;
    _zone.kind = SIGNAL_INLCUDED_KINDS.includes(kind)
      ? DATUM_KIND.signal
      : DATUM_KIND.mixed;
    handleUpdateCorrelations(draft);
  }
}

//action
function handleDeleteZone(draft: Draft<State>, action: DeleteZoneAction) {
  const state = original(draft) as State;

  const activeSpectrum = getActiveSpectrum(state);

  if (activeSpectrum?.id) {
    const { index } = activeSpectrum;
    const { id, assignmentData } = action.payload;
    if (id) {
      const zone = (draft.data[index] as Spectrum2D).zones.values.find(
        (zone) => zone.id === id,
      );
      unlinkInAssignmentData(assignmentData, [zone || {}]);
      const zoneIndex = getZoneIndex(state, index, id);
      (draft.data[index] as Spectrum2D).zones.values.splice(zoneIndex, 1);
    } else {
      unlinkInAssignmentData(
        assignmentData,
        (draft.data[index] as Spectrum2D).zones.values,
      );
      (draft.data[index] as Spectrum2D).zones.values = [];
    }
    handleUpdateCorrelations(draft);
  }
}

function deleteSignal2D(draft: Draft<State>, options: DeleteSignal2DProps) {
  const { spectrum, zone, signal, assignmentData } = options;

  if (spectrum && zone) {
    const datum2D = draft.data.find(
      (datum) => datum.id === spectrum.id,
    ) as Spectrum2D;
    const zoneIndex = datum2D.zones.values.findIndex(
      (_zone) => _zone.id === zone.id,
    );
    const signalIndex = zone.signals.findIndex(
      (_signal) => _signal.id === signal.id,
    );
    // remove assignments for the signal in zone object and global state

    const _zone = unlink(lodashCloneDeep(zone), false, signalIndex, undefined);
    unlinkInAssignmentData(assignmentData, [{ signals: [signal] }], undefined);

    _zone.signals.splice(signalIndex, 1);
    datum2D.zones.values[zoneIndex] = _zone;
    // if no signals are existing in a zone anymore then delete this zone
    if (_zone.signals.length === 0) {
      unlinkInAssignmentData(assignmentData, [_zone]);
      datum2D.zones.values.splice(zoneIndex, 1);
    }

    handleUpdateCorrelations(draft);
  }
}

//action
function handleDeleteSignal(draft: Draft<State>, action: DeleteSignal2DAction) {
  deleteSignal2D(draft, action.payload);
}

//action
function handleSetSignalPathLength(
  draft: Draft<State>,
  action: SetSignalPathLengthAction,
) {
  const { spectrum, zone, signal, pathLength } = action.payload;
  if (spectrum && zone && signal) {
    const datum2D = draft.data.find(
      (datum) => datum.id === spectrum.id,
    ) as Spectrum2D;
    const zoneIndex = datum2D.zones.values.findIndex(
      (_zone) => _zone.id === zone.id,
    );
    const signalIndex = zone.signals.findIndex(
      (_signal) => _signal.id === signal.id,
    );
    const _zone = unlink(lodashCloneDeep(zone), false, signalIndex, undefined);
    _zone.signals[signalIndex].j = {
      ..._zone.signals[signalIndex].j,
      pathLength,
    };
    datum2D.zones.values[zoneIndex] = _zone;

    handleUpdateCorrelations(draft);
  }
}

//action
function unlinkZone(draft: Draft<State>, props: UnlinkZoneProps) {
  const state = original(draft) as State;

  const activeSpectrum = getActiveSpectrum(state);

  if (activeSpectrum?.id) {
    const { index } = activeSpectrum;
    const {
      zone: zoneData,
      assignmentData,
      isOnZoneLevel,
      signalIndex = -1,
      axis,
    } = props;

    if (zoneData) {
      // remove assignments in global state

      const zoneIndex = getZoneIndex(state, index, zoneData.id);

      const zone = lodashCloneDeep(
        (draft.data[index] as Spectrum2D).zones.values[zoneIndex],
      );
      const _zoneData = unlink(zone, isOnZoneLevel, signalIndex, axis);

      unlinkInAssignmentData(
        assignmentData,
        [{ id: zoneData.signals[signalIndex].id }],
        axis,
      );
      (draft.data[index] as Spectrum2D).zones.values[zoneIndex] = _zoneData;
    } else {
      const zones = (draft.data[index] as Spectrum2D).zones.values.map(
        (zone) => {
          return unlink(zone);
        },
      );
      (draft.data[index] as Spectrum2D).zones.values = zones;

      unlinkInAssignmentData(assignmentData, zones);
    }
  }
}
//action
function handleUnlinkZone(draft: Draft<State>, action: UnlinkZoneAction) {
  unlinkZone(draft, action.payload);
}

//action
function handleSetDiaIDZone(draft: Draft<State>, action: SetZoneDiaIDAction) {
  const state = original(draft) as State;

  const activeSpectrum = getActiveSpectrum(state);
  const { zone: zoneData, diaIDs, axis, signalIndex, nbAtoms } = action.payload;

  if (activeSpectrum?.id && axis) {
    const { index } = activeSpectrum;
    const getNbAtoms = (input, current = 0) => input + current;
    const zoneIndex = getZoneIndex(state, index, zoneData.id);
    const zone = (draft.data[index] as Spectrum2D).zones.values[zoneIndex];
    if (!isNumber(signalIndex)) {
      const zoneByAxis = zone[axis];
      zoneByAxis.diaIDs = diaIDs;
      zoneByAxis.nbAtoms = getNbAtoms(nbAtoms, zoneByAxis.nbAtoms);
    } else {
      const signalByAxis = zone.signals[signalIndex][axis];
      signalByAxis.diaIDs = diaIDs;
      signalByAxis.nbAtoms = getNbAtoms(nbAtoms, signalByAxis.nbAtoms);
    }
  }
}

//action
function handleSaveEditedZone(
  draft: Draft<State>,
  action: SaveEditedZoneAction,
) {
  const state = original(draft) as State;

  const activeSpectrum = getActiveSpectrum(state);

  if (activeSpectrum?.id) {
    const { index } = activeSpectrum;
    const {
      zone: { tableMetaInfo, ...editedZone },
    } = action.payload;

    const zoneIndex = getZoneIndex(state, index, editedZone.id);
    (draft.data[index] as Spectrum2D).zones.values[zoneIndex] = editedZone;

    if (editedZone.signals) {
      for (const signal of editedZone.signals) {
        setPathLength(
          draft.correlations.values,
          signal.id,
          signal.j?.pathLength as FromTo,
        );
      }
    }

    handleUpdateCorrelations(draft);
  }
}

function togglePeaksViewProperty(
  draft: Draft<State>,
  key: keyof FilterType<ZonesViewState, boolean>,
) {
  const activeSpectrum = getActiveSpectrum(draft);

  if (activeSpectrum?.id) {
    const zonesView = draft.view.zones;
    if (zonesView[activeSpectrum.id]) {
      zonesView[activeSpectrum.id][key] = !zonesView[activeSpectrum.id][key];
    } else {
      const defaultZonesView = { ...defaultZonesViewState };
      defaultZonesView[key] = !defaultZonesView[key];
      zonesView[activeSpectrum.id] = defaultZonesView;
    }
  }
}

//action
function handleToggleZonesViewProperty(
  draft: Draft<State>,
  action: ToggleZonesViewAction,
) {
  const { key } = action.payload;
  togglePeaksViewProperty(draft, key);
}

export {
  handleAdd2dZone,
  handleAutoZonesDetection,
  handleDeleteSignal,
  deleteSignal2D,
  handleDeleteZone,
  handleChangeZoneSignalDelta,
  handleChangeZoneSignalKind,
  handleUnlinkZone,
  unlinkZone,
  handleSaveEditedZone,
  handleSetDiaIDZone,
  handleSetSignalPathLength,
  handleChangeZonesFactor,
  handleAutoSpectraZonesDetection,
  handleToggleZonesViewProperty,
};
