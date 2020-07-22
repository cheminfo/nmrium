import { produce } from 'immer';

const checkStateProperty = (state, draft) => {
  if (!state.assignmentMeta) {
    draft.assignmentMeta = {};
  }
};

const handleSetActiveAssignmentAxis = (state, action) => {
  return produce(state, (draft) => {
    checkStateProperty(state, draft);
    draft.assignmentMeta.activeAssignmentAxis = action.axis;
  });
};

const handleUnsetActiveAssignmentAxis = (state) => {
  return produce(state, (draft) => {
    checkStateProperty(state, draft);
    delete draft.assignmentMeta.activeAssignmentAxis;
  });
};

export { handleSetActiveAssignmentAxis, handleUnsetActiveAssignmentAxis };
