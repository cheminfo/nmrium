import { original } from 'immer';

import {
  addRange,
  changeRangeSignal,
  detectRanges,
  updateIntegralRanges,
  changeRange,
  changeRangesRealtive,
} from '../../../data/data1d/Datum1D';
import getRange from '../helper/getRange';

import { handleUpdateCorrelations } from './CorrelationsActions';

function handleAutoRangesDetection(draft, detectionOptions) {
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    detectRanges(draft.data[index], detectionOptions);
    handleOnChangeRangesData(draft);
  }
}
function handleDeleteRange(draft, rangeID) {
  const { index } = draft.activeSpectrum;
  const state = original(draft);

  if (rangeID == null) {
    draft.data[index].ranges.values = [];
  } else {
    const peakIndex = state.data[index].ranges.values.findIndex(
      (p) => p.id === rangeID,
    );
    draft.data[index].ranges.values.splice(peakIndex, 1);
  }
  updateIntegralRanges(draft.data[index]);
  handleOnChangeRangesData(draft);
}

function handleChangeRange(draft, action) {
  const state = original(draft);
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;

    const RangeIndex = state.data[index].ranges.values.findIndex(
      (range) => range.id === action.data.id,
    );
    draft.data[index].ranges.values[RangeIndex] = action.data;

    updateIntegralRanges(draft.data[index]);
    handleOnChangeRangesData(draft);
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
  handleChangeRange,
  handleChangeRangeSum,
  handleAddRange,
  handleResizeRange,
  handleChangeRangeRaltiveValue,
  handleChangeRangeSignalValue,
};
