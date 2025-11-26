import type { Range, Signal1D, SignalKind } from '@zakodium/nmr-types';
import type {
  BoundingBox,
  RangesViewState,
  Spectrum1D,
  Spectrum,
} from '@zakodium/nmrium-core';
import type { Draft } from 'immer';
import { original } from 'immer';
import cloneDeep from 'lodash/cloneDeep.js';
import { xFindClosestIndex } from 'ml-spectra-processing';
import { Filters1DManager } from 'nmr-processing';

import type {
  SetSumOptions,
  SumParams,
} from '../../../data/data1d/Spectrum1D/SumManager.js';
import {
  initSumOptions,
  setSumOptions,
} from '../../../data/data1d/Spectrum1D/SumManager.js';
import {
  changeRangeRelativeValue,
  changeRangeSignal,
  detectRanges,
  isSpectrum1D,
  updateRangesRelativeValues,
} from '../../../data/data1d/Spectrum1D/index.js';
import type { ChangeRangeRelativeValueProps } from '../../../data/data1d/Spectrum1D/ranges/changeRangeRelativeValue.js';
import { unlink } from '../../../data/utilities/RangeUtilities.js';
import { isProton } from '../../../data/utilities/isProton.ts';
import type { TargetAssignKeys } from '../../panels/MoleculesPanel/utilities/getAssignIds.ts';
import type { RangeData } from '../../panels/RangesPanel/hooks/useMapRanges.js';
import type { FilterType } from '../../utility/filterType.js';
import type { State } from '../Reducer.js';
import { getActiveSpectrum } from '../helper/getActiveSpectrum.js';
import { getSpectrum } from '../helper/getSpectrum.js';
import {
  initializeRangeViewObject,
  setRangesViewProperty,
} from '../helper/setRangesViewProperty.js';
import type { ActionType } from '../types/ActionType.js';

import { handleUpdateCorrelations } from './CorrelationsActions.js';
import { setDomain } from './DomainActions.js';
import { rollbackSpectrumByFilter } from './FiltersActions.js';
import { toggleDisplayingPeaks } from './PeaksActions.js';
import { resetSelectedTool } from './ToolsActions.js';

type AutoRangesDetectionAction = ActionType<
  'AUTO_RANGES_DETECTION',
  { minMaxRatio: number; lookNegative: boolean }
>;
type DeleteRangeAction = ActionType<
  'DELETE_RANGE',
  {
    resetSelectTool?: boolean;
    id?: string;
    spectrumKey?: string;
  }
>;

//TODO refactor RangeData type
type ChangeRangeSignalKindAction = ActionType<
  'CHANGE_RANGE_SIGNAL_KIND',
  {
    kind: SignalKind;
    range: RangeData;
  }
>;
type SaveEditedRangeAction = ActionType<
  'SAVE_EDITED_RANGE',
  {
    range: RangeData;
  }
>;

interface DeleteSignalProps {
  spectrum: Spectrum;
  range: Range;
  signal: Signal1D;
}
type DeleteSignalAction = ActionType<'DELETE_1D_SIGNAL', DeleteSignalProps>;

interface UnlinkRangeProps {
  rangeKey?: string;
  spectrumId?: string; // If not specified, the currently active spectrum will be used by default.
  signalIndex?: number;
}
type UnlinkRangeAction = ActionType<'UNLINK_RANGE', UnlinkRangeProps>;

type AssignRangeAction = ActionType<
  'ASSIGN_RANGE',
  {
    keys: TargetAssignKeys;
    spectrumId?: string;
  } & Required<Pick<Range, 'diaIDs' | 'nbAtoms' | 'assignment'>>
>;
type ChangeRangesAssignmentsLabelsByDiaIdsAction = ActionType<
  'CHANGE_ASSIGNMENT_LABEL_BY_DIAIDS',
  {
    diaIDs: string[];
    assignment?: string;
    previousAssignment?: string;
  }
>;
type ResizeRangeAction = ActionType<
  'RESIZE_RANGE',
  {
    range: Range;
    spectrumKey: string;
  }
>;
type ChangeRangeSumAction = ActionType<
  'CHANGE_RANGE_SUM',
  {
    options: SetSumOptions;
  }
>;

type AddRangeAction = ActionType<
  'ADD_RANGE',
  {
    range: Range;
  }
>;
type ChangeRangeRelativeValueAction = ActionType<
  'CHANGE_RANGE_RELATIVE',
  ChangeRangeRelativeValueProps
>;
type ChangeRangeSignalValueAction = ActionType<
  'CHANGE_RANGE_SIGNAL_VALUE',
  { rangeID: string; signalID: string; value: number }
>;
type UpdateRangAction = ActionType<'UPDATE_RANGE', { range: Range }>;
type CutRangAction = ActionType<
  'CUT_RANGE',
  { ranges: Record<string, Range[]> }
>;

type ToggleRangesViewAction = ActionType<
  'TOGGLE_RANGES_VIEW_PROPERTY',
  {
    key: keyof FilterType<RangesViewState, boolean>;
    value?: boolean;
    spectrumKey?: string;
  }
>;

type DeleteRangePeakAction = ActionType<
  'DELETE_RANGE_PEAK',
  { id: string; spectrumKey: string }
>;
type ChangeRangeAssignmentLabelAction = ActionType<
  'CHANGE_RANGE_ASSIGNMENT_LABEL',
  { rangeId: string; value: string; spectrumId?: string }
>;

type ChangeRangesViewFloatingBoxBoundingAction = ActionType<
  'CHANGE_RANGES_VIEW_FLOATING_BOX_BOUNDING',
  {
    spectrumKey: string;
    bounding: Partial<BoundingBox>;
    target: Extract<
      keyof RangesViewState,
      'publicationStringBounding' | 'rangesBounding'
    >;
  }
>;

export type RangesActions =
  | AutoRangesDetectionAction
  | DeleteRangeAction
  | ChangeRangeSignalKindAction
  | SaveEditedRangeAction
  | DeleteSignalAction
  | UnlinkRangeAction
  | AssignRangeAction
  | ResizeRangeAction
  | ChangeRangeSumAction
  | AddRangeAction
  | ChangeRangeRelativeValueAction
  | ChangeRangeSignalValueAction
  | UpdateRangAction
  | CutRangAction
  | ToggleRangesViewAction
  | DeleteRangePeakAction
  | ChangeRangeAssignmentLabelAction
  | ChangeRangesViewFloatingBoxBoundingAction
  | ChangeRangesAssignmentsLabelsByDiaIdsAction
  | ActionType<
      | 'AUTO_RANGES_SPECTRA_PICKING'
      | 'CHANGE_RANGES_SUM_FLAG'
      | 'TOGGLE_RANGES_PEAKS_DISPLAYING_MODE'
    >;

function getRangeByIndex(
  draft: Draft<State>,
  spectrumIndex: any,
  rangeID: any,
) {
  return (draft.data[spectrumIndex] as Spectrum1D).ranges.values.findIndex(
    (range) => range.id === rangeID,
  );
}

function getRange(spectrum: Spectrum1D, rangeID: string) {
  return spectrum.ranges.values.findIndex((range) => range.id === rangeID);
}
//action
function handleAutoRangesDetection(
  draft: Draft<State>,
  action: AutoRangesDetectionAction,
) {
  const { data, xDomain, molecules } = draft;

  const activeSpectrum = getActiveSpectrum(draft);

  if (activeSpectrum?.id) {
    const { index } = activeSpectrum;
    const datum = data[index] as Spectrum1D;

    const [from, to] = xDomain;
    const windowFromIndex = xFindClosestIndex(datum.data.x, from);
    const windowToIndex = xFindClosestIndex(datum.data.x, to);

    // minMaxRatio default 0.05, lookNegative default false,
    const { minMaxRatio, lookNegative } = action.payload;

    const nucleus = datum.info.nucleus;
    const isProtonic = isProton(nucleus);

    const detectionOptions: any = {
      rangePicking: {
        integrationSum: 100,
        compile: isProtonic,
        frequencyCluster: isProtonic ? 16 : 0,
        clean: 0.5,
        keepPeaks: true,
        joinOverlapRanges: isProtonic,
      },
      peakPicking: {
        smoothY: false,
        sensitivity: 100,
        broadWidth: 0.05,
        thresholdFactor: 8,
        minMaxRatio,
        direction: lookNegative ? 'both' : 'positive',
      },
    };
    detectRanges(datum, {
      ...detectionOptions,
      windowFromIndex,
      windowToIndex,
      molecules,
      nucleus,
    });
    handleUpdateCorrelations(draft);
  }
}

//action
function handleAutoSpectraRangesDetection(draft: Draft<State>) {
  const peakPicking = {
    sensitivity: 100,
    thresholdFactor: 8,
    minMaxRatio: 0.05,
  };
  const { data, molecules } = draft;

  for (const datum of data) {
    if (datum.info.dimension === 1) {
      const nucleus = datum.info.nucleus as string;
      const isProtonic = isProton(nucleus);
      const rangePicking = {
        integrationSum: 100,
        compile: isProtonic,
        frequencyCluster: isProtonic ? 16 : 0,
        clean: 0.5,
        keepPeaks: true,
        joinOverlapRanges: isProtonic,
      };
      detectRanges(datum as Spectrum1D, {
        peakPicking,
        rangePicking,
        molecules,
        nucleus,
      });
      handleUpdateCorrelations(draft);
    }
  }
}

//action
function handleDeleteRange(draft: Draft<State>, action: DeleteRangeAction) {
  const { id, resetSelectTool = false, spectrumKey } = action.payload;

  const datum = getSpectrum(draft, spectrumKey);

  if (!datum || !isSpectrum1D(datum)) {
    return;
  }

  if (id) {
    const rangeIndex = getRange(datum, id);
    datum.ranges.values.splice(rangeIndex, 1);
  } else {
    datum.ranges.values = [];
  }
  updateRangesRelativeValues(datum);
  handleUpdateCorrelations(draft);
  if (resetSelectTool) {
    resetSelectedTool(draft);
  }
}

//action
function handleChangeRangeSignalKind(
  draft: Draft<State>,
  action: ChangeRangeSignalKindAction,
) {
  const state = original(draft) as State;

  const activeSpectrum = getActiveSpectrum(state);

  if (activeSpectrum?.id) {
    const { index } = activeSpectrum;
    const { range, kind } = action.payload;
    const rangeIndex = getRangeByIndex(state, index, range.id);
    const _range = (draft.data[index] as Spectrum1D).ranges.values[rangeIndex];
    if (_range?.signals) {
      _range.signals[range.tableMetaInfo.signalIndex].kind = kind;
      updateRangesRelativeValues(draft.data[index] as Spectrum1D);
      handleUpdateCorrelations(draft);
    }
  }
}

//action
function handleSaveEditedRange(
  draft: Draft<State>,
  action: SaveEditedRangeAction,
) {
  const state = original(draft) as State;

  const activeSpectrum = getActiveSpectrum(state);

  if (activeSpectrum?.id) {
    const { index } = activeSpectrum;
    const { range } = action.payload;

    // remove assignments in global state

    const _editedRowData: any = unlink(range);

    delete _editedRowData.tableMetaInfo;
    delete _editedRowData.rowKey;
    // remove assignments in assignment hook data
    // for now: clear all assignments for this range because signals or levels to store might have changed
    const rangeIndex = getRangeByIndex(state, index, _editedRowData.id);

    if (_editedRowData.id === 'new') {
      _editedRowData.id = crypto.randomUUID();
    }

    (draft.data[index] as Spectrum1D).ranges.values.splice(
      rangeIndex,
      1,
      _editedRowData,
    );
    updateRangesRelativeValues(draft.data[index] as Spectrum1D);
    handleUpdateCorrelations(draft);
    resetSelectedTool(draft);
  }
}

function deleteSignal1D(draft: Draft<State>, props: DeleteSignalProps) {
  const { spectrum, range, signal } = props;

  const datum1D = draft.data.find(
    (datum) => datum.id === spectrum.id,
  ) as Spectrum1D;
  const rangeIndex = datum1D.ranges.values.findIndex(
    (_range) => _range.id === range.id,
  );
  const signalIndex = range.signals.findIndex(
    (_signal) => _signal.id === signal.id,
  );
  // remove assignments for the signal range object in global state
  const _range = unlink(cloneDeep(range), {
    unlinkType: 'signal',
    signalIndex,
  });

  _range.signals.splice(signalIndex, 1);
  datum1D.ranges.values[rangeIndex] = _range;
  // if no signals are existing in a range anymore then delete this range
  if (_range.signals.length === 0) {
    datum1D.ranges.values.splice(rangeIndex, 1);
  }

  handleUpdateCorrelations(draft);
}

//action
function handleDeleteSignal(draft: Draft<State>, action: DeleteSignalAction) {
  deleteSignal1D(draft, action.payload);
}

function unlinkRange(draft: Draft<State>, options: UnlinkRangeProps = {}) {
  const { spectrumId } = options;
  const spectrum = getSpectrum(draft, spectrumId);

  if (!isSpectrum1D(spectrum)) return;

  const { rangeKey, signalIndex = -1 } = options || {};
  const ranges = spectrum.ranges.values;

  if (rangeKey) {
    const rangeIndex = getRange(spectrum, rangeKey);
    const unlinkType = signalIndex === -1 ? 'range' : 'signal';
    ranges[rangeIndex] = unlink(ranges[rangeIndex], {
      unlinkType,
      signalIndex,
    });
  } else {
    const newRanges = ranges.map((range) => {
      return unlink(range);
    });
    spectrum.ranges.values = newRanges;
  }
}

//action
function handleUnlinkRange(draft: Draft<State>, action: UnlinkRangeAction) {
  unlinkRange(draft, action.payload);
}

//action
function handleAssignRange(draft: Draft<State>, action: AssignRangeAction) {
  const { keys, diaIDs, nbAtoms, spectrumId, assignment } = action.payload;

  const spectrum = getSpectrum(draft, spectrumId);

  if (!spectrum || !isSpectrum1D(spectrum)) return;

  if (keys.length === 1) {
    const [{ index }] = keys;
    const range = spectrum.ranges.values[index];

    if (!range) return;

    range.diaIDs = diaIDs;
    range.nbAtoms = nbAtoms + (range.nbAtoms || 0);

    if (assignment && !range.assignment) {
      range.assignment = assignment;
    }
  } else {
    const [{ index: rangeIndex }, { index: signalIndex }] = keys;
    const range = spectrum.ranges.values[rangeIndex];

    if (!range) return;

    const signal = range.signals[signalIndex];

    if (!signal) return;

    signal.diaIDs = diaIDs;
    signal.nbAtoms = nbAtoms + (signal.nbAtoms || 0);
  }
}
//action
function handleChangeRangesAssignmentLabelsByDiaIds(
  draft: Draft<State>,
  action: ChangeRangesAssignmentsLabelsByDiaIdsAction,
) {
  const { diaIDs, assignment, previousAssignment } = action.payload;

  const uniqueDiaIds = new Set(diaIDs);

  const spectrum = getSpectrum(draft);

  if (!spectrum || !isSpectrum1D(spectrum)) return;

  const {
    ranges: { values },
  } = spectrum;

  for (const range of values) {
    const { diaIDs: rangeDiaIDs = [], signals = [] } = range;

    const matchesRange = rangeDiaIDs.some((id) => uniqueDiaIds.has(id));
    const matchesSignals = signals.some((s) =>
      s.diaIDs?.some((id) => uniqueDiaIds.has(id)),
    );

    if (
      ((!range.assignment || previousAssignment === range.assignment) &&
        matchesRange) ||
      matchesSignals
    ) {
      range.assignment = assignment;
    }
  }
}
//action
function handleResizeRange(draft: Draft<State>, action: ResizeRangeAction) {
  const { range, spectrumKey } = action.payload;

  const spectrum = getSpectrum(draft, spectrumKey);

  if (!spectrum) return;

  if (!range || !isSpectrum1D(spectrum)) return;

  const index = spectrum.ranges.values.findIndex((i: any) => i.id === range.id);

  spectrum.ranges.values[index] = range;
  updateRangesRelativeValues(spectrum);
}

//action
function handleChangeRangeSum(
  draft: Draft<State>,
  action: ChangeRangeSumAction,
) {
  const { options } = action.payload;
  const {
    data,
    view: {
      spectra: { activeTab: nucleus },
    },
  } = draft;

  const activeSpectrum = getActiveSpectrum(draft);
  if (activeSpectrum?.id) {
    const { index } = activeSpectrum;
    const datum = data[index] as Spectrum1D;
    setSumOptions(datum.ranges, { options, nucleus });
    updateRangesRelativeValues(datum, true);
  }
}

function initiateRangeSumOptions(datum: Spectrum1D, options: SumParams) {
  const { nucleus, molecules } = options;
  datum.ranges.options = initSumOptions(datum.ranges.options, {
    molecules,
    nucleus,
  });
}

//action
function handleAddRange(draft: Draft<State>, action: AddRangeAction) {
  const { range } = action.payload;
  const {
    data,
    view: {
      spectra: { activeTab: nucleus },
    },
    molecules,
  } = draft;
  const activeSpectrum = getActiveSpectrum(draft);
  if (activeSpectrum?.id) {
    const { index } = activeSpectrum;
    const datum = data[index] as Spectrum1D;
    datum.ranges.values.push(range);
    initiateRangeSumOptions(datum, {
      nucleus,
      molecules,
    });
    updateRangesRelativeValues(datum);
    handleUpdateCorrelations(draft);
  }
}

//action
function handleChangeRangeRelativeValue(
  draft: any,
  action: ChangeRangeRelativeValueAction,
) {
  const data = action.payload;
  const activeSpectrum = getActiveSpectrum(draft);
  if (activeSpectrum?.id) {
    const { index } = activeSpectrum;
    changeRangeRelativeValue(draft.data[index], data);
  }
}

//action
function handleChangeRangeSignalValue(
  draft: any,
  action: ChangeRangeSignalValueAction,
) {
  const { rangeID, signalID, value } = action.payload;
  const activeSpectrum = getActiveSpectrum(draft);

  if (activeSpectrum?.id) {
    const { index } = activeSpectrum;

    const shift = changeRangeSignal(draft.data[index], {
      rangeID,
      signalID,
      newSignalValue: value,
    });
    rollbackSpectrumByFilter(draft, {
      key: 'shiftX',
      searchBy: 'name',
      applyFilter: false,
    });
    Filters1DManager.applyFilters(draft.data[index], [
      { name: 'shiftX', value: { shift } },
    ]);

    handleUpdateCorrelations(draft);
    setDomain(draft);
  }
}

//action
function handleChangeRangesSumFlag(draft: Draft<State>) {
  const activeSpectrum = getActiveSpectrum(draft);

  if (activeSpectrum?.id) {
    const { index } = activeSpectrum;
    const options = (draft.data[index] as Spectrum1D).ranges.options;
    options.isSumConstant = !options.isSumConstant;
  }
}

//action
function handleUpdateRange(draft: Draft<State>, action: UpdateRangAction) {
  const { range } = action.payload;

  const activeSpectrum = getActiveSpectrum(draft);
  if (activeSpectrum?.id && range.id) {
    const datum = draft.data[activeSpectrum?.index] as Spectrum1D;
    const index = datum.ranges.values.findIndex(
      (_range) => _range.id === range.id,
    );
    datum.ranges.values[index] = range;
  }
}

function toggleRangesViewProperty(
  draft: Draft<State>,
  key: keyof FilterType<RangesViewState, boolean>,
  options: {
    spectrumKey?: string;
    value?: boolean;
  },
) {
  const { value, spectrumKey } = options;
  if (typeof value === 'boolean') {
    setRangesViewProperty(draft, key, { value, spectrumKey });
  } else {
    setRangesViewProperty(draft, key, { value: (flag) => !flag, spectrumKey });
  }
}

//action
function handleToggleRangesViewProperty(
  draft: Draft<State>,
  action: ToggleRangesViewAction,
) {
  const { key, value, spectrumKey } = action.payload;
  toggleRangesViewProperty(draft, key, { spectrumKey, value });
}

function handleCutRange(draft: Draft<State>, action: CutRangAction) {
  const { ranges: cutRanges } = action.payload;
  const spectrum = getSpectrum(draft) as Spectrum1D;
  const ranges = spectrum.ranges.values;

  for (let i = 0; i < ranges.length; i++) {
    const { id } = ranges[i];
    if (cutRanges?.[id]) {
      ranges.splice(i, 1);
      ranges.push(...cutRanges[id]);
    }
  }

  updateRangesRelativeValues(spectrum);
  handleUpdateCorrelations(draft);
}

function handleChangePeaksDisplayingMode(draft: Draft<State>) {
  toggleDisplayingPeaks(draft, 'ranges');
}

//action
function handleDeleteRangePeak(
  draft: Draft<State>,
  action: DeleteRangePeakAction,
) {
  const { id, spectrumKey } = action.payload;
  const [rangeKey, signalKey, peakKey] = id.split(',');
  const spectrum = getSpectrum(draft, spectrumKey);
  if (!spectrum) return;

  const range = (spectrum as any).ranges.values.find(
    (range: any) => range.id === rangeKey,
  );
  const signal = range?.signals.find((singla: any) => singla.id === signalKey);
  if (signal) {
    signal.peaks = signal.peaks?.filter((peak: any) => peak.id !== peakKey);
  }
}

function handleChangeRangeAssignmentLabel(
  draft: Draft<State>,
  action: ChangeRangeAssignmentLabelAction,
) {
  const { rangeId, value, spectrumId } = action.payload;
  const spectrum = getSpectrum(draft, spectrumId);

  if (!spectrum || !isSpectrum1D(spectrum)) return;

  initializeRangeViewObject(draft, spectrum.id);

  const rangesView = draft.view.ranges[spectrum.id];

  if (!rangesView.showAssignmentsLabels) {
    rangesView.showAssignmentsLabels = true;
  }

  const range = spectrum.ranges.values.find((range) => range.id === rangeId);
  if (range) {
    range.assignment = value;
  }
}

function handleChangeRangesViewFloatingBoxBounding(
  draft: Draft<State>,
  action: ChangeRangesViewFloatingBoxBoundingAction,
) {
  const { spectrumKey, bounding, target } = action.payload;

  initializeRangeViewObject(draft, spectrumKey);

  const rangesView = draft.view.ranges[spectrumKey];

  rangesView[target] = {
    ...rangesView[target],
    ...bounding,
  };
}

export {
  deleteSignal1D,
  handleAddRange,
  handleAssignRange,
  handleAutoRangesDetection,
  handleAutoSpectraRangesDetection,
  handleChangePeaksDisplayingMode,
  handleChangeRangeAssignmentLabel,
  handleChangeRangeRelativeValue,
  handleChangeRangeSignalKind,
  handleChangeRangeSignalValue,
  handleChangeRangeSum,
  handleChangeRangesAssignmentLabelsByDiaIds,
  handleChangeRangesSumFlag,
  handleChangeRangesViewFloatingBoxBounding,
  handleCutRange,
  handleDeleteRange,
  handleDeleteRangePeak,
  handleDeleteSignal,
  handleResizeRange,
  handleSaveEditedRange,
  handleToggleRangesViewProperty,
  handleUnlinkRange,
  handleUpdateRange,
};
