import type { Filter2DEntry, Signal2D, Zone } from '@zakodium/nmr-types';
import type {
  Spectrum2D,
  Spectrum,
  ZonesViewState,
} from '@zakodium/nmrium-core';
import type { FromTo, NmrData2DFt } from 'cheminfo-types';
import type { Draft } from 'immer';
import { original } from 'immer';
import lodashCloneDeep from 'lodash/cloneDeep.js';
import { setPathLength } from 'nmr-correlation';
import { Filters2DManager } from 'nmr-processing';

import {
  DATUM_KIND,
  SIGNAL_INCLUDED_KINDS,
} from '../../../data/constants/signalsKinds.js';
import {
  changeZoneSignal,
  detectZones,
  detectZonesManual,
  isSpectrum2D,
} from '../../../data/data2d/Spectrum2D/index.js';
import type { DetectionZonesOptions } from '../../../data/data2d/Spectrum2D/zones/getDetectionZones.js';
import { unlink } from '../../../data/utilities/ZoneUtilities.js';
import type { Axis } from '../../assignment/AssignmentsContext.js';
import { defaultZonesViewState } from '../../hooks/useActiveSpectrumZonesViewState.js';
import type { TargetAssignKeys } from '../../panels/MoleculesPanel/Utilities.js';
import type { ZoneData } from '../../panels/ZonesPanel/hooks/useMapZones.js';
import type { FilterType } from '../../utility/filterType.js';
import type { State } from '../Reducer.js';
import type { ZoneBoundary } from '../helper/get2DRange.js';
import get2DRange from '../helper/get2DRange.js';
import { getActiveSpectrum } from '../helper/getActiveSpectrum.js';
import type { ActionType } from '../types/ActionType.js';

import { handleUpdateCorrelations } from './CorrelationsActions.js';
import { setDomain } from './DomainActions.js';

interface DeleteSignal2DProps {
  spectrum: Spectrum;
  zone: Zone;
  signal: Signal2D;
}

type ChangeZonesFactorAction = ActionType<
  'CHANGE_ZONES_NOISE_FACTOR',
  { zonesNoiseFactor: number; zonesMinMaxRatio: number }
>;

type Add2dZoneAction = ActionType<'ADD_2D_ZONE', ZoneBoundary>;

type AutoZonesDetectionAction = ActionType<
  'AUTO_ZONES_DETECTION',
  { zonesNoiseFactor: number; zonesMinMaxRatio: number }
>;
type ChangeZoneSignalDeltaAction = ActionType<
  'CHANGE_ZONE_SIGNAL_VALUE',
  { zoneId: string; signal: { id?: string; deltaX?: number; deltaY?: number } }
>;
type ChangeZoneSignalKindAction = ActionType<
  'CHANGE_ZONE_SIGNAL_KIND',
  { zoneData: ZoneData; kind: string }
>;
type DeleteZoneAction = ActionType<'DELETE_2D_ZONE', { id?: string }>;
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

type AssignZoneAction = ActionType<
  'ASSIGN_ZONE',
  {
    keys: TargetAssignKeys;
    axis?: Axis;
  } & Required<Pick<Zone['x'], 'diaIDs' | 'nbAtoms'>>
>;
type SaveEditedZoneAction = ActionType<
  'SAVE_EDITED_ZONE',
  {
    zone: ZoneData;
  }
>;

interface UnlinkZoneProps {
  zoneKey?: string;
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

type ChangeZoneAssignmentLabelAction = ActionType<
  'CHANGE_ZONE_ASSIGNMENT_LABEL',
  { zoneID: string; value: string }
>;
type SetZoneAssignmentLabelCoordinationAction = ActionType<
  'SET_ZONE_ASSIGNMENT_LABEL_COORDINATION',
  { zoneID: string; coordination: { x: number; y: number } }
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
  | AssignZoneAction
  | SaveEditedZoneAction
  | UnlinkZoneAction
  | ToggleZonesViewAction
  | ChangeZoneAssignmentLabelAction
  | SetZoneAssignmentLabelCoordinationAction
  | ActionType<'AUTO_ZONES_SPECTRA_PICKING'>;

//action
function handleChangeZonesFactor(
  draft: Draft<State>,
  action: ChangeZonesFactorAction,
) {
  draft.toolOptions.data.zonesNoiseFactor = action.payload.zonesNoiseFactor;
  draft.toolOptions.data.zonesMinMaxRatio = action.payload.zonesMinMaxRatio;
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
      maxPercentCutOff: draft.toolOptions.data.zonesMinMaxRatio,
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
    const {
      zonesNoiseFactor: thresholdFactor,
      zonesMinMaxRatio: maxPercentCutOff,
    } = action.payload;
    const [fromX, toX] = draft.xDomain;
    const [fromY, toY] = draft.yDomain;
    const detectionOptions: DetectionZonesOptions = {
      selectedZone: { fromX, toX, fromY, toY },
      thresholdFactor,
      maxPercentCutOff,
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
        maxPercentCutOff: 0.03,
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
    const filters: Filter2DEntry[] = [];
    if (xShift !== 0) {
      filters.push({
        name: 'shift2DX',
        value: { shift: xShift },
        enabled: true,
      });
    }
    if (yShift !== 0) {
      filters.push({
        name: 'shift2DY',
        value: { shift: yShift },
        enabled: true,
      });
    }

    Filters2DManager.applyFilters(draft.data[index] as Spectrum2D, filters);

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
    _zone.kind = SIGNAL_INCLUDED_KINDS.includes(kind)
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
    const { id } = action.payload;
    if (id) {
      const zoneIndex = getZoneIndex(state, index, id);
      (draft.data[index] as Spectrum2D).zones.values.splice(zoneIndex, 1);
    } else {
      (draft.data[index] as Spectrum2D).zones.values = [];
    }
    handleUpdateCorrelations(draft);
  }
}

function deleteSignal2D(draft: Draft<State>, options: DeleteSignal2DProps) {
  const { spectrum, zone, signal } = options;

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

    _zone.signals.splice(signalIndex, 1);
    datum2D.zones.values[zoneIndex] = _zone;
    // if no signals are existing in a zone anymore then delete this zone
    if (_zone.signals.length === 0) {
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

  if (!activeSpectrum) return;
  const { index } = activeSpectrum;
  const spectrum = draft.data[index];

  if (!isSpectrum2D(spectrum)) return;

  const { zoneKey, isOnZoneLevel, signalIndex = -1, axis } = props;
  const zones = spectrum.zones.values;

  if (zoneKey) {
    // remove assignments in global state
    const zoneIndex = getZoneIndex(state, index, zoneKey);
    const zone = zones[zoneIndex];
    zones[zoneIndex] = unlink(zone, isOnZoneLevel, signalIndex, axis);
  } else {
    const newZones = zones.map((zone) => {
      return unlink(zone);
    });
    spectrum.zones.values = newZones;
  }
}
//action
function handleUnlinkZone(draft: Draft<State>, action: UnlinkZoneAction) {
  unlinkZone(draft, action.payload);
}

//action
function handleAssignZone(draft: Draft<State>, action: AssignZoneAction) {
  const state = original(draft) as State;

  const activeSpectrum = getActiveSpectrum(state);
  const { keys, diaIDs, axis, nbAtoms } = action.payload;

  if (!activeSpectrum || !axis) return;

  const { index } = activeSpectrum;
  const spectrum = draft.data[index];

  if (!isSpectrum2D(spectrum)) return;

  const [{ index: zoneIndex }] = keys;

  const zone = spectrum.zones.values[zoneIndex];
  if (keys.length === 1) {
    const zoneByAxis = zone[axis];
    zoneByAxis.diaIDs = diaIDs;
    zoneByAxis.nbAtoms = nbAtoms + (zoneByAxis?.nbAtoms || 0);
  } else {
    const [, { index: signalIndex }] = keys;

    const signalByAxis = zone.signals[signalIndex][axis];
    signalByAxis.diaIDs = diaIDs;
    signalByAxis.nbAtoms = nbAtoms + (signalByAxis?.nbAtoms || 0);
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

function initializeZoneViewObject(draft: Draft<State>, spectrumID: string) {
  const zonesView = draft.view.zones;

  if (spectrumID in zonesView) return;

  const defaultZonesView = { ...defaultZonesViewState };
  zonesView[spectrumID] = defaultZonesView;
}

function togglePeaksViewProperty(
  draft: Draft<State>,
  key: keyof FilterType<ZonesViewState, boolean>,
) {
  const activeSpectrum = getActiveSpectrum(draft);

  if (!activeSpectrum?.id) return;

  initializeZoneViewObject(draft, activeSpectrum.id);

  const zonesView = draft.view.zones;
  zonesView[activeSpectrum.id][key] = !zonesView[activeSpectrum.id][key];
}

//action
function handleToggleZonesViewProperty(
  draft: Draft<State>,
  action: ToggleZonesViewAction,
) {
  const { key } = action.payload;
  togglePeaksViewProperty(draft, key);
}

function handleChangeZoneAssignmentLabel(
  draft: Draft<State>,
  action: ChangeZoneAssignmentLabelAction,
) {
  const { zoneID, value } = action.payload;
  const activeSpectrum = getActiveSpectrum(draft);

  if (!activeSpectrum?.id) return;

  const { index } = activeSpectrum;
  const spectrum = draft.data[index];

  if (!isSpectrum2D(spectrum)) return;
  initializeZoneViewObject(draft, activeSpectrum.id);

  const zoneView = draft.view.zones[spectrum.id];

  if (!zoneView.showAssignmentsLabels) {
    zoneView.showAssignmentsLabels = true;
  }

  const zone = spectrum.zones.values.find((zone) => zone.id === zoneID);
  if (zone) {
    zone.assignment = value;

    if (!value) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete zoneView.assignmentsLabelsCoordinates[zoneID];
    }
  }
}

function handleSetZoneAssignmentLabelCoordination(
  draft: Draft<State>,
  action: SetZoneAssignmentLabelCoordinationAction,
) {
  const { zoneID, coordination } = action.payload;
  const activeSpectrum = getActiveSpectrum(draft);

  if (!activeSpectrum) return;

  initializeZoneViewObject(draft, activeSpectrum.id);

  const zonesView = draft.view.zones;
  zonesView[activeSpectrum.id].assignmentsLabelsCoordinates[zoneID] =
    coordination;
}

export {
  deleteSignal2D,
  handleAdd2dZone,
  handleAssignZone,
  handleAutoSpectraZonesDetection,
  handleAutoZonesDetection,
  handleChangeZoneAssignmentLabel,
  handleChangeZoneSignalDelta,
  handleChangeZoneSignalKind,
  handleChangeZonesFactor,
  handleDeleteSignal,
  handleDeleteZone,
  handleSaveEditedZone,
  handleSetSignalPathLength,
  handleSetZoneAssignmentLabelCoordination,
  handleToggleZonesViewProperty,
  handleUnlinkZone,
  unlinkZone,
};
