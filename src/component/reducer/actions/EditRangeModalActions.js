import { produce } from 'immer';

import { getXScale } from '../../1d/utilities/scale';

const checkStateProperty = (state, draft) => {
  if (!state.editRangeModalMeta) {
    draft.editRangeModalMeta = {};
  }
};

const handleSetRangeInEdition = (state, action) => {
  return produce(state, (draft) => {
    checkStateProperty(state, draft);
    draft.editRangeModalMeta.rangeInEdition = action.rangeID;
  });
};

const handleUnsetRangeInEdition = (state) => {
  return produce(state, (draft) => {
    if (state.editRangeModalMeta) {
      draft.editRangeModalMeta.rangeInEdition = null;
    }
  });
};

const handleSetNewSignalDeltaSelectionIsEnabled = (state, action) => {
  return produce(state, (draft) => {
    checkStateProperty(state, draft);
    draft.editRangeModalMeta.newSignalDeltaSelectionIsEnabled =
      action.isEnabled;
  });
};

const handleSetSelectedNewSignalDelta = (state, action) => {
  return produce(state, (draft) => {
    const scaleX = getXScale(null, state);
    const delta = scaleX.invert(action.position);

    checkStateProperty(state, draft);
    draft.editRangeModalMeta.newSignalDelta = delta;
  });
};

const handleUnsetSelectedNewSignalDelta = (state) => {
  return produce(state, (draft) => {
    if (state.editRangeModalMeta) {
      draft.editRangeModalMeta.newSignalDelta = null;
    }
  });
};

export {
  handleSetRangeInEdition,
  handleUnsetRangeInEdition,
  handleSetNewSignalDeltaSelectionIsEnabled,
  handleSetSelectedNewSignalDelta,
  handleUnsetSelectedNewSignalDelta,
};
