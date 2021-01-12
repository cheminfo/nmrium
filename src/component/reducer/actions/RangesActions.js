import { produce } from 'immer';

import { getXScale } from '../../1d/utilities/scale';
import { AnalysisObj } from '../core/Analysis';

const handleAutoRangesDetection = (state, detectionOptions) => {
  return produce(state, (draft) => {
    if (state.activeSpectrum) {
      const { id, index } = state.activeSpectrum;
      const ob = AnalysisObj.getDatum(id);
      const ranges = ob.detectRanges(detectionOptions);
      draft.data[index].ranges = ranges;
    }
  });
};
const handleDeleteRange = (state, rangeID) => {
  return produce(state, (draft) => {
    const { id, index } = state.activeSpectrum;
    const ob = AnalysisObj.getDatum(id);
    ob.deleteRange(rangeID);
    draft.data[index].ranges = ob.getRanges();
  });
};

const handleChangeRange = (state, action) => {
  return produce(state, (draft) => {
    if (state.activeSpectrum) {
      const { id, index } = state.activeSpectrum;
      const datumObject = AnalysisObj.getDatum(id);
      datumObject.setRange(action.data);
      draft.data[index].ranges = datumObject.getRanges();
    }
  });
};

const handleResizeRange = (state, action) => {
  return produce(state, (draft) => {
    if (state.activeSpectrum) {
      const { id, index } = state.activeSpectrum;
      const datumObject = AnalysisObj.getDatum(id);
      datumObject.changeRange(action.data);
      draft.data[index].ranges = datumObject.getRanges();
    }
  });
};

const handleChangeRangeSum = (state, value) => {
  return produce(state, (draft) => {
    if (state.activeSpectrum) {
      const { id, index } = state.activeSpectrum;
      const datumObject = AnalysisObj.getDatum(id);
      datumObject.changeRangesSum(value);
      draft.data[index].ranges = datumObject.getRanges();
    }
  });
};
const handleAddRange = (state, action) => {
  return produce(state, (draft) => {
    const scaleX = getXScale(state);

    const start = scaleX.invert(action.startX);
    const end = scaleX.invert(action.endX);
    let range = [];
    if (start > end) {
      range = [end, start];
    } else {
      range = [start, end];
    }

    if (draft.activeSpectrum) {
      const { id, index } = state.activeSpectrum;
      const datumObject = AnalysisObj.getDatum(id);
      datumObject.addRange(range[0], range[1]);
      draft.data[index].ranges = datumObject.getRanges();
    }
  });
};

const handleChangeRangeRaltiveValue = (state, action) => {
  const { id: rangeID, value } = action;
  const { id, index } = state.activeSpectrum;
  const datumObject = AnalysisObj.getDatum(id);
  const ranges = datumObject.changeRangesRealtive(rangeID, value);
  return produce(state, (draft) => {
    draft.data[index].ranges.values = ranges;
  });
};

const handleChangeRangeSignalValue = (state, action) => {
  const { rangeID, signalID, value } = action.payload;
  const { id, index } = state.activeSpectrum;
  const datumObject = AnalysisObj.getDatum(id);
  const ranges = datumObject.changeRangeSignal(rangeID, signalID, value);
  return produce(state, (draft) => {
    draft.data[index].ranges.values = ranges;
  });
};

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
