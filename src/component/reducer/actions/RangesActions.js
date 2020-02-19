import { produce } from 'immer';

import { options } from '../../toolbar/ToolTypes';
import { AnalysisObj } from '../core/initiate';
import { getScale } from './ScaleActions';

const handleAutoRangesDetection = (state, detectionOptions) => {
  return produce(state, (draft) => {
    if (state.activeSpectrum) {
      const { id, index } = state.activeSpectrum;
      draft.selectedTool = options.zoom.id;
      draft.selectedOptionPanel = null;
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

const handelChangeRange = (state, action) => {
  return produce(state, (draft) => {
    if (state.activeSpectrum) {
      const { id, index } = state.activeSpectrum;
      const datumObject = AnalysisObj.getDatum(id);
      datumObject.setRange(action.data);
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
    const scale = getScale(state).x;

    const start = scale.invert(action.startX);
    const end = scale.invert(action.endX);

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

export {
  handleAutoRangesDetection,
  handleDeleteRange,
  handelChangeRange,
  handleChangeRangeSum,
  handleAddRange,
};
