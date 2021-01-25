import { getXScale } from '../../1d/utilities/scale';

function handleAutoRangesDetection(draft, detectionOptions) {
  if (draft.activeSpectrum) {
    const { id, index } = draft.activeSpectrum;
    const ob = draft.AnalysisObj.getDatum(id);
    const ranges = ob.detectRanges(detectionOptions);
    draft.data[index].ranges = ranges;
  }
}
function handleDeleteRange(draft, rangeID) {
  const { id, index } = draft.activeSpectrum;
  const ob = draft.AnalysisObj.getDatum(id);
  ob.deleteRange(rangeID);
  draft.data[index].ranges = ob.getRanges();
}

function handleChangeRange(draft, action) {
  if (draft.activeSpectrum) {
    const { id, index } = draft.activeSpectrum;
    const datumObject = draft.AnalysisObj.getDatum(id);
    datumObject.setRange(action.data);
    draft.data[index].ranges = datumObject.getRanges();
  }
}

function handleResizeRange(draft, action) {
  if (draft.activeSpectrum) {
    const { id, index } = draft.activeSpectrum;
    const datumObject = draft.AnalysisObj.getDatum(id);
    datumObject.changeRange(action.data);
    draft.data[index].ranges = datumObject.getRanges();
  }
}

function handleChangeRangeSum(draft, value) {
  if (draft.activeSpectrum) {
    const { id, index } = draft.activeSpectrum;
    const datumObject = draft.AnalysisObj.getDatum(id);
    datumObject.changeRangesSum(value);
    draft.data[index].ranges = datumObject.getRanges();
  }
}
function handleAddRange(draft, action) {
  const scaleX = getXScale(draft);

  const start = scaleX.invert(action.startX);
  const end = scaleX.invert(action.endX);
  let range = [];
  if (start > end) {
    range = [end, start];
  } else {
    range = [start, end];
  }

  if (draft.activeSpectrum) {
    const { id, index } = draft.activeSpectrum;
    const datumObject = draft.AnalysisObj.getDatum(id);
    datumObject.addRange(range[0], range[1]);
    draft.data[index].ranges = datumObject.getRanges();
  }
}

function handleChangeRangeRaltiveValue(draft, action) {
  const { id: rangeID, value } = action;
  const { id, index } = draft.activeSpectrum;
  const datumObject = draft.AnalysisObj.getDatum(id);
  const ranges = datumObject.changeRangesRealtive(rangeID, value);
  draft.data[index].ranges.values = ranges;
}

function handleChangeRangeSignalValue(draft, action) {
  const { rangeID, signalID, value } = action.payload;
  const { id, index } = draft.activeSpectrum;
  const datumObject = draft.AnalysisObj.getDatum(id);
  const ranges = datumObject.changeRangeSignal(rangeID, signalID, value);
  draft.data[index].ranges.values = ranges;
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
