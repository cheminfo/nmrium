import { v4 } from '@lukeed/uuid';
import { Draft, original } from 'immer';
import cloneDeep from 'lodash/cloneDeep';
import { xFindClosestIndex } from 'ml-spectra-processing';
import { Spectrum, Spectrum1D } from 'nmr-load-save';
import { Signal1D, Range, Filters, FiltersManager } from 'nmr-processing';

import {
  DatumKind,
  SignalKindsToInclude,
} from '../../../data/constants/SignalsKinds';
import {
  addRange,
  changeRangeSignal,
  detectRanges,
  updateRangesRelativeValues,
  changeRange,
  changeRangeRelativeValue,
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
import { rangeStateInit, State } from '../Reducer';
import { getActiveSpectrum } from '../helper/getActiveSpectrum';
import getRange from '../helper/getRange';
import { getSpectrum } from '../helper/getSpectrum';
import { ActionType } from '../types/ActionType';

import { handleUpdateCorrelations } from './CorrelationsActions';
import { setDomain, setIntegralsYDomain } from './DomainActions';
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
    startX: number;
    endX: number;
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
type ToggleAction = ActionType<
  'SHOW_MULTIPLICITY_TREES' | 'SHOW_RANGES_INTEGRALS' | 'SHOW_J_GRAPH',
  { id: string }
>;
type CutRangAction = ActionType<'CUT_RANGE', { cutValue: number }>;

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
  | ToggleAction
  | CutRangAction
  | ActionType<'AUTO_RANGES_SPECTRA_PICKING' | 'CHANGE_RANGES_SUM_FLAG'>;

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
      ranges,
    },
  } = draft;

  const activeSpectrum = getActiveSpectrum(draft);

  if (activeSpectrum?.id) {
    const { index, id } = activeSpectrum;
    const datum = data[index] as Spectrum1D;

    // add range intial state
    const range = ranges.find((r) => r.spectrumID === id);
    if (!range) {
      ranges.push({
        spectrumID: id,
        ...rangeStateInit,
      });
    }

    const [from, to] = xDomain;
    const windowFromIndex = xFindClosestIndex(datum.data.x, from);
    const windowToIndex = xFindClosestIndex(datum.data.x, to);

    // minMaxRatio default 0.05, lookNegative default false,
    const { minMaxRatio, lookNegative } = action.payload;

    const detectionOptions: any = {
      peakPicking: {
        factorStd: 8,
        integrationSum: 100,
        compile: true,
        frequencyCluster: 16,
        clean: true,
        keepPeaks: true,
        minMaxRatio,
        lookNegative,
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
    setIntegralsYDomain(draft, datum);
  }
}

//action
function handleAutoSpectraRangesDetection(draft: Draft<State>) {
  const peakPicking = {
    factorStd: 8,
    minMaxRatio: 0.05,
    integrationSum: 100,
    compile: true,
    frequencyCluster: 16,
    clean: true,
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
      detectRanges(datum as Spectrum1D, { peakPicking, molecules, nucleus });
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
      _range.kind = SignalKindsToInclude.includes(kind)
        ? DatumKind.signal
        : DatumKind.mixed;
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
  const activeSpectrum = getActiveSpectrum(draft);
  if (activeSpectrum?.id) {
    const { index } = activeSpectrum;
    const { range } = action.payload;
    changeRange(draft.data[index] as Spectrum1D, range);
  }
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
  const { startX, endX } = action.payload;
  const range = getRange(draft, { startX, endX });
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
    const [from, to] = range;
    const datum = data[index] as Spectrum1D;
    addRange(datum, {
      from,
      to,
    });
    initiateRangeSumOptions(datum, {
      nucleus,
      molecules,
    });
    updateRangesRelativeValues(datum);
    handleUpdateCorrelations(draft);
    setIntegralsYDomain(draft, data[index] as Spectrum1D);
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

//action
function handleShowMultiplicityTrees(
  draft: Draft<State>,
  action: ToggleAction,
) {
  const { id } = action.payload;
  const range = draft.view.ranges.find((r) => r.spectrumID === id);
  if (range) {
    range.showMultiplicityTrees = !range.showMultiplicityTrees;
  } else {
    draft.view.ranges.push({
      spectrumID: id,
      ...rangeStateInit,
      showMultiplicityTrees: !rangeStateInit.showMultiplicityTrees,
    });
  }
}

//action
function handleShowRangesIntegrals(draft: Draft<State>, action: ToggleAction) {
  const { id } = action.payload;
  const range = draft.view.ranges.find((r) => r.spectrumID === id);
  if (range) {
    range.showRangesIntegrals = !range.showRangesIntegrals;
  } else {
    draft.view.ranges.push({
      spectrumID: id,
      ...rangeStateInit,
      showRangesIntegrals: !rangeStateInit.showRangesIntegrals,
    });
  }
}

//action
function handleShowJGraph(draft: Draft<State>, action: ToggleAction) {
  const { id } = action.payload;
  const range = draft.view.ranges.find((r) => r.spectrumID === id);
  if (range) {
    range.showJGraph = !range.showJGraph;
  } else {
    draft.view.ranges.push({
      spectrumID: id,
      ...rangeStateInit,
      showJGraph: !rangeStateInit.showJGraph,
    });
  }
}

function handleCutRange(draft: Draft<State>, action: CutRangAction) {
  const { cutValue } = action.payload;
  const spectrum = getSpectrum(draft) as Spectrum1D;
  const ranges = spectrum.ranges.values;

  for (let i = 0; i < ranges.length; i++) {
    const { to, from } = ranges[i];
    if (cutValue > from && cutValue < to) {
      ranges.splice(i, 1);
      addRange(spectrum, { from, to: cutValue });
      addRange(spectrum, { from: cutValue, to });
    }
  }

  updateRangesRelativeValues(spectrum);
  setIntegralsYDomain(draft, spectrum);
  handleUpdateCorrelations(draft);
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
  handleShowMultiplicityTrees,
  handleShowRangesIntegrals,
  handleAutoSpectraRangesDetection,
  handleShowJGraph,
};
