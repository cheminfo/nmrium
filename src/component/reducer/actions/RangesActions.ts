import { v4 } from '@lukeed/uuid';
import { Draft, original } from 'immer';
import cloneDeep from 'lodash/cloneDeep';
import { xFindClosestIndex } from 'ml-spectra-processing';
import { RangesViewState, Spectrum, Spectrum1D } from 'nmr-load-save';
import { Signal1D, Range, Filters, FiltersManager } from 'nmr-processing';

import {
  DATUM_KIND,
  SIGNAL_INLCUDED_KINDS,
} from '../../../data/constants/signalsKinds';
import {
  changeRangeSignal,
  detectRanges,
  updateRangesRelativeValues,
  changeRangeRelativeValue,
  isSpectrum1D,
} from '../../../data/data1d/Spectrum1D';
import {
  SetSumOptions,
  SumParams,
  initSumOptions,
  setSumOptions,
} from '../../../data/data1d/Spectrum1D/SumManager';
import { ChangeRangeRelativeValueProps } from '../../../data/data1d/Spectrum1D/ranges/changeRangeRelativeValue';
import {
  unlink,
  unlinkInAssignmentData,
} from '../../../data/utilities/RangeUtilities';
import { AssignmentContext } from '../../assignment/AssignmentsContext';
import { RangeData } from '../../panels/RangesPanel/hooks/useMapRanges';
import { FilterType } from '../../utility/filterType';
import { State } from '../Reducer';
import { getActiveSpectrum } from '../helper/getActiveSpectrum';
import { getSpectrum } from '../helper/getSpectrum';
import {
  initializeRangeViewObject,
  setRangesViewProperty,
} from '../helper/setRangesViewProperty';
import { ActionType } from '../types/ActionType';

import { handleUpdateCorrelations } from './CorrelationsActions';
import { setDomain } from './DomainActions';
import { toggleDisplayingPeaks } from './PeaksActions';
import { resetSelectedTool } from './ToolsActions';

type AutoRangesDetectionAction = ActionType<
  'AUTO_RANGES_DETECTION',
  { minMaxRatio: number; lookNegative: boolean }
>;
type DeleteRangeAction = ActionType<
  'DELETE_RANGE',
  {
    resetSelectTool?: boolean;
    id?: string;
    assignmentData: AssignmentContext;
  }
>;

//TODO refactor RangeData type
type ChangeRangeSignalKindAction = ActionType<
  'CHANGE_RANGE_SIGNAL_KIND',
  {
    kind: string;
    range: RangeData;
  }
>;
type SaveEditedRangeAction = ActionType<
  'SAVE_EDITED_RANGE',
  {
    range: RangeData;
    assignmentData: AssignmentContext;
  }
>;

interface DeleteSignalProps {
  spectrum: Spectrum;
  range: Range;
  signal: Signal1D;
  assignmentData: AssignmentContext;
}
type DeleteSignalAction = ActionType<'DELETE_1D_SIGNAL', DeleteSignalProps>;

interface UnlinkRangeProps {
  range?: Range;
  signalIndex?: number;
  assignmentData: AssignmentContext;
}
type UnlinkRangeAction = ActionType<'UNLINK_RANGE', UnlinkRangeProps>;
type SetDiaIDRangeAction = ActionType<
  'SET_DIAID_RANGE',
  {
    range: Range;
    signalIndex: number;
  } & Pick<Range, 'diaIDs' | 'nbAtoms'>
>;
type ResizeRangeAction = ActionType<
  'RESIZE_RANGE',
  {
    range: Range;
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
  }
>;

type DeleteRangePeakAction = ActionType<'DELETE_RANGE_PEAK', { id: string }>;
type ChangeRangeAssignmentLabelAction = ActionType<
  'CHANGE_RANGE_ASSIGNMENT_LABEL',
  { rangeID: string; value: string }
>;
export type RangesActions =
  | AutoRangesDetectionAction
  | DeleteRangeAction
  | ChangeRangeSignalKindAction
  | SaveEditedRangeAction
  | DeleteSignalAction
  | UnlinkRangeAction
  | SetDiaIDRangeAction
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
  | ActionType<
      | 'AUTO_RANGES_SPECTRA_PICKING'
      | 'CHANGE_RANGES_SUM_FLAG'
      | 'TOGGLE_RANGES_PEAKS_DISPLAYING_MODE'
    >;

function getRangeIndex(draft: Draft<State>, spectrumIndex, rangeID) {
  return (draft.data[spectrumIndex] as Spectrum1D).ranges.values.findIndex(
    (range) => range.id === rangeID,
  );
}

//action
function handleAutoRangesDetection(
  draft: Draft<State>,
  action: AutoRangesDetectionAction,
) {
  const {
    data,
    xDomain,
    molecules,
    view: {
      spectra: { activeTab: nucleus },
    },
  } = draft;

  const activeSpectrum = getActiveSpectrum(draft);

  if (activeSpectrum?.id) {
    const { index } = activeSpectrum;
    const datum = data[index] as Spectrum1D;

    const [from, to] = xDomain;
    const windowFromIndex = xFindClosestIndex(datum.data.x, from);
    const windowToIndex = xFindClosestIndex(datum.data.x, to);

    // minMaxRatio default 0.05, lookNegative default false,
    const { minMaxRatio, lookNegative } = action.payload;

    const detectionOptions: any = {
      rangePicking: {
        integrationSum: 100,
        compile: true,
        frequencyCluster: 16,
        clean: 0.3,
        keepPeaks: true,
      },
      peakPicking: {
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
    thresholdFactor: 8,
    minMaxRatio: 0.05,
  };
  const rangePicking = {
    integrationSum: 100,
    compile: true,
    frequencyCluster: 16,
    clean: 0.3,
    keepPeaks: true,
  };
  const {
    data,
    view: {
      spectra: { activeTab: nucleus },
    },
    molecules,
  } = draft;
  for (const datum of data) {
    if (datum.info.dimension === 1) {
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
  const activeSpectrum = getActiveSpectrum(draft);
  if (activeSpectrum?.id) {
    const { index } = activeSpectrum;
    const { id, assignmentData, resetSelectTool = false } = action.payload;
    const datum = draft.data[index] as Spectrum1D;
    if (id) {
      const rangeIndex = getRangeIndex(draft, index, id);
      unlinkInAssignmentData(assignmentData, [datum.ranges.values[rangeIndex]]);
      datum.ranges.values.splice(rangeIndex, 1);
    } else {
      unlinkInAssignmentData(assignmentData, datum.ranges.values);
      datum.ranges.values = [];
    }
    updateRangesRelativeValues(datum);
    handleUpdateCorrelations(draft);
    if (resetSelectTool) {
      resetSelectedTool(draft);
    }
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
    const rangeIndex = getRangeIndex(state, index, range.id);
    const _range = (draft.data[index] as Spectrum1D).ranges.values[rangeIndex];
    if (_range?.signals) {
      _range.signals[range.tableMetaInfo.signalIndex].kind = kind;
      _range.kind = SIGNAL_INLCUDED_KINDS.includes(kind)
        ? DATUM_KIND.signal
        : DATUM_KIND.mixed;
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
    const { range, assignmentData } = action.payload;

    // remove assignments in global state

    const _editedRowData: any = unlink(range);

    delete _editedRowData.tableMetaInfo;
    delete _editedRowData.rowKey;
    // remove assignments in assignment hook data
    // for now: clear all assignments for this range because signals or levels to store might have changed
    unlinkInAssignmentData(assignmentData, [_editedRowData]);

    const rangeIndex = getRangeIndex(state, index, _editedRowData.id);

    if (_editedRowData.id === 'new') {
      _editedRowData.id = v4();
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
  const { spectrum, range, signal, assignmentData } = props;

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

  unlinkInAssignmentData(assignmentData, [{ signals: [signal] }]);

  _range.signals.splice(signalIndex, 1);
  datum1D.ranges.values[rangeIndex] = _range;
  // if no signals are existing in a range anymore then delete this range
  if (_range.signals.length === 0) {
    unlinkInAssignmentData(assignmentData, [_range]);
    datum1D.ranges.values.splice(rangeIndex, 1);
  }

  handleUpdateCorrelations(draft);
}

//action
function handleDeleteSignal(draft: Draft<State>, action: DeleteSignalAction) {
  deleteSignal1D(draft, action.payload);
}

function unlinkRange(draft: Draft<State>, data: UnlinkRangeProps) {
  const activeSpectrum = getActiveSpectrum(draft);
  if (activeSpectrum?.id) {
    const { index } = activeSpectrum;
    const { assignmentData, range: rangeData, signalIndex = -1 } = data;

    // remove assignments in global state
    if (rangeData) {
      const rangeIndex = getRangeIndex(draft, index, rangeData.id);
      const range = cloneDeep(
        (draft.data[index] as Spectrum1D).ranges.values[rangeIndex],
      );

      let newRange: any = {};
      let id = rangeData.id;
      if (rangeData && signalIndex === -1) {
        newRange = unlink(range, { unlinkType: 'range' });
      } else {
        newRange = unlink(range, { unlinkType: 'signal', signalIndex });
        id = rangeData.signals[signalIndex].id;
      }
      // remove assignments in assignment hook data
      unlinkInAssignmentData(assignmentData, [
        {
          id,
        },
      ]);
      (draft.data[index] as Spectrum1D).ranges.values[rangeIndex] = newRange;
    } else {
      const ranges = (draft.data[index] as Spectrum1D).ranges.values.map(
        (range) => {
          return unlink(range);
        },
      );
      (draft.data[index] as Spectrum1D).ranges.values = ranges;

      unlinkInAssignmentData(assignmentData, ranges);
    }
  }
}

//action
function handleUnlinkRange(draft: Draft<State>, action: UnlinkRangeAction) {
  unlinkRange(draft, action.payload);
}

//action
function handleSetDiaIDRange(draft: Draft<State>, action: SetDiaIDRangeAction) {
  const activeSpectrum = getActiveSpectrum(draft);
  if (activeSpectrum?.id) {
    const { index } = activeSpectrum;
    const { range: rangeData, diaIDs, signalIndex, nbAtoms } = action.payload;
    const getNbAtoms = (input, current = 0) => input + current;
    const rangeIndex = getRangeIndex(draft, index, rangeData.id);
    const _range = (draft.data[index] as Spectrum1D).ranges.values[rangeIndex];
    if (signalIndex === undefined) {
      _range.diaIDs = diaIDs;
      _range.nbAtoms = getNbAtoms(nbAtoms, _range.nbAtoms);
    } else {
      _range.signals[signalIndex].diaIDs = diaIDs;
      _range.signals[signalIndex].nbAtoms = getNbAtoms(
        nbAtoms,
        _range.signals[signalIndex].nbAtoms,
      );
    }
    // _range.nbAtoms = getNbAtoms(_range);
  }
}

//action
function handleResizeRange(draft: Draft<State>, action: ResizeRangeAction) {
  const spectrum = getSpectrum(draft);

  if (!spectrum) return;
  const { range } = action.payload;

  if (!range && !isSpectrum1D(spectrum)) return;

  const index = spectrum.ranges.values.findIndex((i) => i.id === range.id);

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
  draft,
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
  draft,
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
    FiltersManager.applyFilter(draft.data[index], [
      { name: Filters.shiftX.id, value: { shift } },
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
  value?: boolean,
) {
  if (typeof value === 'boolean') {
    setRangesViewProperty(draft, key, value);
  } else {
    setRangesViewProperty(draft, key, (flag) => !flag);
  }
}

//action
function handleToggleRangesViewProperty(
  draft: Draft<State>,
  action: ToggleRangesViewAction,
) {
  const { key, value } = action.payload;
  toggleRangesViewProperty(draft, key, value);
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
  const { id } = action.payload;
  const [rangeKey, signalKey, peakKey] = id.split(',');

  const activeSpectrum = getActiveSpectrum(draft);
  if (activeSpectrum?.id) {
    const datum = draft.data[activeSpectrum?.index] as Spectrum1D;
    const range = datum.ranges.values.find((range) => range.id === rangeKey);
    const signal = range?.signals.find((singla) => singla.id === signalKey);
    if (signal) {
      signal.peaks = signal.peaks?.filter((peak) => peak.id !== peakKey);
    }
  }
}

function handleChangeRangeAssignmentLabel(
  draft: Draft<State>,
  action: ChangeRangeAssignmentLabelAction,
) {
  const { rangeID, value } = action.payload;
  const activeSpectrum = getActiveSpectrum(draft);

  if (activeSpectrum?.id) {
    const { index } = activeSpectrum;
    const spectrum = draft.data[index];

    if (!isSpectrum1D(spectrum)) {
      return;
    }

    initializeRangeViewObject(draft, activeSpectrum.id);

    const rangesView = draft.view.ranges[spectrum.id];

    if (!rangesView.showAssignmentsLabels) {
      rangesView.showAssignmentsLabels = true;
    }

    const range = spectrum.ranges.values.find((range) => range.id === rangeID);
    if (range) {
      range.assignment = value;
    }
  }
}

export {
  handleCutRange,
  handleAutoRangesDetection,
  handleDeleteRange,
  deleteSignal1D,
  handleDeleteSignal,
  handleChangeRangeSum,
  handleAddRange,
  handleResizeRange,
  handleChangeRangeRelativeValue,
  handleChangeRangeSignalValue,
  handleChangeRangeSignalKind,
  handleSaveEditedRange,
  handleUnlinkRange,
  unlinkRange,
  handleSetDiaIDRange,
  handleChangeRangesSumFlag,
  handleUpdateRange,
  handleAutoSpectraRangesDetection,
  handleToggleRangesViewProperty,
  handleChangePeaksDisplayingMode,
  handleDeleteRangePeak,
  handleChangeRangeAssignmentLabel,
};
