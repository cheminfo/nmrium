import { original } from 'immer';

import {
  DatumKind,
  SignalKindsToInclude,
} from '../../../data/constants/SignalsKinds';
import {
  addRange,
  changeRangeSignal,
  detectRanges,
  updateIntegralRanges,
  changeRange,
  changeRangesRealtive,
} from '../../../data/data1d/Datum1D';
import {
  unlink,
  unlinkInAssignmentData,
} from '../../../data/utilities/RangeUtilities';
import getRange from '../helper/getRange';

import { handleUpdateCorrelations } from './CorrelationsActions';

function handleAutoRangesDetection(draft, detectionOptions) {
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    detectRanges(draft.data[index], detectionOptions);
    handleOnChangeRangesData(draft);
  }
}
function handleDeleteRange(draft, action) {
  const state = original(draft);
  if (state.activeSpectrum?.id) {
    const { index } = state.activeSpectrum;
    const { rangeData, assignmentData } = action.payload;
    if (rangeData === null) {
      draft.data[index].ranges.values = [];
    } else {
      unlinkInAssignmentData(assignmentData, rangeData);
      const peakIndex = state.data[index].ranges.values.findIndex(
        (_range) => _range.id === rangeData.id,
      );
      draft.data[index].ranges.values.splice(peakIndex, 1);
    }
    updateIntegralRanges(draft.data[index]);
    handleOnChangeRangesData(draft);
  }
}

function getRangeIndex(state, spectrumIndex, rangeID) {
  return state.data[spectrumIndex].ranges.values.findIndex(
    (range) => range.id === rangeID,
  );
}

function handleChangeRangeSignalKind(draft, action) {
  const state = original(draft);
  if (state.activeSpectrum?.id) {
    const { index } = state.activeSpectrum;
    const { rowData, value } = action.payload;
    const rangeIndex = getRangeIndex(state, index, rowData.id);
    const _range = draft.data[index].ranges.values[rangeIndex];
    _range.signal[rowData.tableMetaInfo.signalIndex].kind = value;
    _range.kind = SignalKindsToInclude.includes(value)
      ? DatumKind.signal
      : DatumKind.mixed;
    updateIntegralRanges(draft.data[index]);
    handleOnChangeRangesData(draft);
  }
}

function handleSaveEditedRange(draft, action) {
  const state = original(draft);
  if (state.activeSpectrum?.id) {
    const { index } = state.activeSpectrum;
    const { editedRowData, assignmentData } = action.payload;
    let _editedRowData = { ...editedRowData };
    delete _editedRowData.tableMetaInfo;
    // remove assignments in assignment hook data
    // for now: clear all assignments for this range because signals or levels to store might have changed
    unlinkInAssignmentData(assignmentData, _editedRowData);
    // remove assignments in global state
    _editedRowData = unlink(_editedRowData);

    const rangeIndex = getRangeIndex(state, index, _editedRowData.id);
    draft.data[index].ranges.values[rangeIndex] = _editedRowData;
    updateIntegralRanges(draft.data[index]);
    handleOnChangeRangesData(draft);
  }
}

function handleUnlinkRange(draft, action) {
  const state = original(draft);
  if (state.activeSpectrum?.id) {
    const { index } = state.activeSpectrum;
    const {
      rangeData,
      assignmentData,
      isOnRangeLevel,
      signalIndex,
    } = action.payload;
    // remove assignments in assignment hook data
    unlinkInAssignmentData(
      assignmentData,
      rangeData,
      isOnRangeLevel,
      signalIndex,
    );
    // remove assignments in global state
    const _rangeData = unlink({ ...rangeData });

    const rangeIndex = getRangeIndex(state, index, _rangeData.id);
    draft.data[index].ranges.values[rangeIndex] = _rangeData;
  }
}

function handleResizeRange(draft, action) {
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    changeRange(draft.data[index], action.data);
  }
}

function handleChangeRangeSum(draft, value) {
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    draft.data[index].ranges.sum = value;
    updateIntegralRanges(draft.data[index]);
  }
}
function handleAddRange(draft, action) {
  const { startX, endX } = action;
  const range = getRange(draft, { startX, endX });

  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    const [from, to] = range;
    addRange(draft.data[index], { from, to });
    handleOnChangeRangesData(draft);
  }
}

function handleChangeRangeRaltiveValue(draft, action) {
  const { id: rangeID, value } = action;
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    changeRangesRealtive(draft.data[index], rangeID, value);
  }
}

function handleChangeRangeSignalValue(draft, action) {
  const { rangeID, signalID, value } = action.payload;
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    changeRangeSignal(draft.data[index], rangeID, signalID, value);
    handleOnChangeRangesData(draft);
  }
}

function handleOnChangeRangesData(draft) {
  handleUpdateCorrelations(draft);
}

export {
  handleAutoRangesDetection,
  handleDeleteRange,
  handleChangeRangeSum,
  handleAddRange,
  handleResizeRange,
  handleChangeRangeRaltiveValue,
  handleChangeRangeSignalValue,
  handleChangeRangeSignalKind,
  handleSaveEditedRange,
  handleUnlinkRange,
};
