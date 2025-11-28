import type { Range, SignalKind } from '@zakodium/nmr-types';
import type {
  BoundingBox,
  RangesViewState,
  Spectrum1D,
} from '@zakodium/nmrium-core';
import type { Draft } from 'immer';
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
import type { DetectRangesOptions } from '../../../data/data1d/Spectrum1D/ranges/detectRanges.ts';
import { unlink } from '../../../data/utilities/RangeUtilities.js';
import { isProton } from '../../../data/utilities/isProton.ts';
import type { TargetAssignKeys } from '../../panels/MoleculesPanel/utilities/getAssignIds.ts';
import type { RangeData } from '../../panels/RangesPanel/hooks/useMapRanges.js';
import type { FilterType } from '../../utility/filterType.js';
import type { State } from '../Reducer.js';
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
  spectrumId: string;
  range: Range;
  signalId: string;
}
type DeleteSignalAction = ActionType<'DELETE_1D_SIGNAL', DeleteSignalProps>;

interface UnAssign1DSignalOptions {
  rangeKey?: string;
  spectrumId?: string; // If not specified, the currently active spectrum will be used by default.
  signalIndex?: number;
}
type UnAssign1DSignalAction = ActionType<'UNASSIGN_1D_SIGNAL', UnAssign1DSignalOptions>;

type Assign1DSignalAction = ActionType<
  'ASSIGN_1D_SIGNAL',
  {
    keys: TargetAssignKeys;
    spectrumId?: string;
  } & Required<Pick<Signal1D, 'diaIDs' | 'nbAtoms' | 'assignment'>>
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
  { rangeId: string; signalId: string; value: number }
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
type Change1DSignalAssignmentLabelAction = ActionType<
  'CHANGE_1D_SIGNAL_ASSIGNMENT_LABEL',
  { rangeId: string, signalId?: string; value: string; spectrumId?: string }
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
  | UnAssign1DSignalAction
  | Assign1DSignalAction
  | ResizeRangeAction
  | ChangeRangeSumAction
  | AddRangeAction
  | ChangeRangeRelativeValueAction
  | ChangeRangeSignalValueAction
  | UpdateRangAction
  | CutRangAction
  | ToggleRangesViewAction
  | DeleteRangePeakAction
  | Change1DSignalAssignmentLabelAction
  | ChangeRangesViewFloatingBoxBoundingAction
  | ChangeRangesAssignmentsLabelsByDiaIdsAction
  | ActionType<
    | 'AUTO_RANGES_SPECTRA_PICKING'
    | 'CHANGE_RANGES_SUM_FLAG'
    | 'TOGGLE_RANGES_PEAKS_DISPLAYING_MODE'
  >;

function getRangeIndex(spectrum: Spectrum1D, rangeId: string) {
  return spectrum.ranges.values.findIndex((range) => range.id === rangeId);
}

//action
function handleAutoRangesDetection(
  draft: Draft<State>,
  action: AutoRangesDetectionAction,
) {
  const { xDomain, molecules } = draft;

  const spectrum = getSpectrum(draft);

  if (isSpectrum1D(spectrum)) {
    const [from, to] = xDomain;
    const windowFromIndex = xFindClosestIndex(spectrum.data.x, from);
    const windowToIndex = xFindClosestIndex(spectrum.data.x, to);

    // minMaxRatio default 0.05, lookNegative default false,
    const { minMaxRatio, lookNegative } = action.payload;

    const nucleus = spectrum.info.nucleus;
    const isProtonic = isProton(nucleus);

    const detectionOptions: DetectRangesOptions = {
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
    detectRanges(spectrum, {
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
  const peakPicking: DetectRangesOptions['peakPicking'] = {
    sensitivity: 100,
    thresholdFactor: 8,
    minMaxRatio: 0.05,
  };
  const { data, molecules } = draft;

  for (const spectrum of data) {
    if (isSpectrum1D(spectrum)) {
      const nucleus = spectrum.info.nucleus;
      const isProtonic = isProton(nucleus);
      const rangePicking = {
        integrationSum: 100,
        compile: isProtonic,
        frequencyCluster: isProtonic ? 16 : 0,
        clean: 0.5,
        keepPeaks: true,
        joinOverlapRanges: isProtonic,
      };
      detectRanges(spectrum, {
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
    const rangeIndex = getRangeIndex(datum, id);
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
  const { range, kind } = action.payload;

  const spectrum = getSpectrum(draft);
  if (!isSpectrum1D(spectrum)) return;

  const rangeIndex = getRangeIndex(spectrum, range.id);
  const _range = spectrum.ranges.values[rangeIndex];
  if (_range?.signals) {
    _range.signals[range.tableMetaInfo.signalIndex].kind = kind;
    updateRangesRelativeValues(spectrum);
    handleUpdateCorrelations(draft);
  }
}

//action
function handleSaveEditedRange(
  draft: Draft<State>,
  action: SaveEditedRangeAction,
) {
  const { range } = action.payload;

  const spectrum = getSpectrum(draft);
  if (!isSpectrum1D(spectrum)) return;

  // remove assignments in global state
  const _editedRowData: any = unlink(range);

  delete _editedRowData.tableMetaInfo;
  delete _editedRowData.rowKey;
  // remove assignments in assignment hook data
  // for now: clear all assignments for this range because signals or levels to store might have changed
  const rangeIndex = getRangeIndex(spectrum, _editedRowData.id);

  if (_editedRowData.id === 'new') {
    _editedRowData.id = crypto.randomUUID();
  }

  spectrum.ranges.values.splice(rangeIndex, 1, _editedRowData);
  updateRangesRelativeValues(spectrum);
  handleUpdateCorrelations(draft);
  resetSelectedTool(draft);
}

function deleteSignal1D(draft: Draft<State>, props: DeleteSignalProps) {
  const { spectrumId, range, signalId } = props;

  const spectrum = getSpectrum(draft, spectrumId);
  if (!isSpectrum1D(spectrum)) return;

  const rangeIndex = getRangeIndex(spectrum, range.id);
  const signalIndex = range.signals.findIndex(
    (_signal) => _signal.id === signalId,
  );
  // Remove assignments for the signal range object in the global state.
  const _range = unlink(cloneDeep(range), {
    unlinkType: 'signal',
    signalIndex,
  });

  _range.signals.splice(signalIndex, 1);
  spectrum.ranges.values[rangeIndex] = _range;
  // If no signals are existing in a range any more, then delete this range.
  if (_range.signals.length === 0) {
    spectrum.ranges.values.splice(rangeIndex, 1);
  }

  handleUpdateCorrelations(draft);
}

//action
function handleDeleteSignal(draft: Draft<State>, action: DeleteSignalAction) {
  deleteSignal1D(draft, action.payload);
}

function clearSignalAssignment(draft: Draft<State>, options: UnAssign1DSignalOptions = {}) {
  const { spectrumId, rangeKey, signalIndex = -1 } = options;

  const spectrum = getSpectrum(draft, spectrumId);
  if (!isSpectrum1D(spectrum)) return;

  const ranges = spectrum.ranges.values;
  if (rangeKey) {
    const rangeIndex = getRangeIndex(spectrum, rangeKey);
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
function handleUnAssign1DSignal(draft: Draft<State>, action: UnAssign1DSignalAction) {
  clearSignalAssignment(draft, action.payload);
}

//action
function handleAssign1DSignal(draft: Draft<State>, action: Assign1DSignalAction) {
  const { keys, diaIDs, nbAtoms, spectrumId, assignment } = action.payload;

  const spectrum = getSpectrum(draft, spectrumId);

  //TODO: Refactor TargetAssignKeys after completing the 2D assignment and remove keys.length !== 2 condition
  if (!isSpectrum1D(spectrum) || keys.length !== 2) return;

  if (keys.length !== 2) return;
  const [{ index: rangeIndex }, { index: signalIndex }] = keys;
  const range = spectrum.ranges.values[rangeIndex];

  if (!range) return;

  const signal = range.signals[signalIndex];

  if (!signal) return;

  if (assignment && !signal.assignment) {
    signal.assignment = assignment;
  }

  signal.diaIDs = diaIDs;
  signal.nbAtoms = nbAtoms + (signal.nbAtoms || 0);

}
//action
function handleChangeRangesAssignmentLabelsByDiaIds(
  draft: Draft<State>,
  action: ChangeRangesAssignmentsLabelsByDiaIdsAction,
) {
  const { diaIDs, assignment, previousAssignment } = action.payload;

  const spectrum = getSpectrum(draft);
  if (!isSpectrum1D(spectrum)) return;

  const uniqueDiaIds = new Set(diaIDs);
  const {
    ranges: { values },
  } = spectrum;

  for (const range of values) {
    const { signals = [] } = range;

    for (const signal of signals) {
      if (previousAssignment === signal.assignment && uniqueDiaIds.has(signal.id)) {
        signal.assignment = assignment;
      }
    }

  }
}
//action
function handleResizeRange(draft: Draft<State>, action: ResizeRangeAction) {
  const { range, spectrumKey } = action.payload;

  const spectrum = getSpectrum(draft, spectrumKey);
  if (!isSpectrum1D(spectrum)) return;

  const index = spectrum.ranges.values.findIndex(
    (_range) => _range.id === range.id,
  );

  spectrum.ranges.values[index] = range;
  updateRangesRelativeValues(spectrum);
}

//action
function handleChangeRangeSum(
  draft: Draft<State>,
  action: ChangeRangeSumAction,
) {
  const { options } = action.payload;

  const spectrum = getSpectrum(draft);
  if (!isSpectrum1D(spectrum)) return;

  setSumOptions(spectrum.ranges, { options, nucleus: spectrum.info.nucleus });
  updateRangesRelativeValues(spectrum, true);
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

  const spectrum = getSpectrum(draft);
  if (!isSpectrum1D(spectrum)) return;

  const { molecules } = draft;
  spectrum.ranges.values.push(range);
  initiateRangeSumOptions(spectrum, {
    nucleus: spectrum.info.nucleus,
    molecules,
  });

  updateRangesRelativeValues(spectrum);
  handleUpdateCorrelations(draft);
}

//action
function handleChangeRangeRelativeValue(
  draft: Draft<State>,
  action: ChangeRangeRelativeValueAction,
) {
  const spectrum = getSpectrum(draft);
  if (!isSpectrum1D(spectrum)) return;

  changeRangeRelativeValue(spectrum, action.payload);
}

//action
function handleChangeRangeSignalValue(
  draft: Draft<State>,
  action: ChangeRangeSignalValueAction,
) {
  const { rangeId, signalId, value } = action.payload;

  const spectrum = getSpectrum(draft);
  if (!isSpectrum1D(spectrum)) return;

  const shift = changeRangeSignal(spectrum, {
    rangeId,
    signalId,
    newSignalValue: value,
  });
  rollbackSpectrumByFilter(draft, {
    key: 'shiftX',
    searchBy: 'name',
    applyFilter: false,
  });
  Filters1DManager.applyFilters(spectrum, [
    { name: 'shiftX', value: { shift } },
  ]);

  handleUpdateCorrelations(draft);
  setDomain(draft);
}

//action
function handleChangeRangesSumFlag(draft: Draft<State>) {
  const spectrum = getSpectrum(draft);
  if (!isSpectrum1D(spectrum)) return;

  const options = spectrum.ranges.options;
  options.isSumConstant = !options.isSumConstant;
}

//action
function handleUpdateRange(draft: Draft<State>, action: UpdateRangAction) {
  const { range } = action.payload;

  const spectrum = getSpectrum(draft);
  if (!isSpectrum1D(spectrum)) return;

  const index = spectrum.ranges.values.findIndex(
    (_range) => _range.id === range.id,
  );
  spectrum.ranges.values[index] = range;
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

  const spectrum = getSpectrum(draft);
  if (!isSpectrum1D(spectrum)) return;

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

  const spectrum = getSpectrum(draft, spectrumKey);
  if (!isSpectrum1D(spectrum)) return;

  const [rangeKey, signalKey, peakKey] = id.split(',');
  const range = spectrum.ranges.values.find((range) => range.id === rangeKey);
  const signal = range?.signals.find((signal) => signal.id === signalKey);
  if (signal) {
    signal.peaks = signal.peaks?.filter((peak) => peak.id !== peakKey);
  }
}

function handleChange1DSignalAssignmentLabel(
  draft: Draft<State>,
  action: Change1DSignalAssignmentLabelAction,
) {
  const { rangeId, signalId, value, spectrumId } = action.payload;

  const spectrum = getSpectrum(draft, spectrumId);
  if (!isSpectrum1D(spectrum)) return;

  initializeRangeViewObject(draft, spectrum.id);

  const rangesView = draft.view.ranges[spectrum.id];
  if (!rangesView.showAssignmentsLabels) {
    rangesView.showAssignmentsLabels = true;
  }

  const range = spectrum.ranges.values.find((range) => range.id === rangeId);
  if (!range) return;

  const signal = signalId
    ? range.signals.find(s => s.id === signalId)
    : range.signals[0];


  if (!signal) return;

  signal.assignment = value;

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
  clearSignalAssignment,
  deleteSignal1D,
  handleAddRange,
  handleAssign1DSignal,
  handleAutoRangesDetection,
  handleAutoSpectraRangesDetection,
  handleChange1DSignalAssignmentLabel,
  handleChangePeaksDisplayingMode,
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
  handleUnAssign1DSignal,
  handleUpdateRange,
};
