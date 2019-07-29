/**
 * undo history base on Rdux implementation
 */

import { UNDO, REDO, SET, RESET } from './HistoryActions';

const handleUndo = (state) => {
  const { past, present, future } = state;
  const previous = past[past.length - 1];
  const newPast = past.slice(0, past.length - 1);

  return {
    past: newPast,
    present: previous,
    future: [present, ...future],
  };
};

const handleRedo = (state) => {
  const { past, present, future } = state;
  const next = future[0];
  const newFuture = future.slice(1);

  return {
    past: [...past, present],
    present: next,
    future: newFuture,
  };
};

const handleSet = (state, action) => {
  const { newPresent } = action;
  const { past, present } = state;
  if (newPresent === present) {
    return state;
  }
  return {
    past: [...past, present],
    present: newPresent,
    future: [],
  };
};

const handleReset = (action) => {
  const { newPresent } = action;
  return {
    past: [],
    present: newPresent,
    future: [],
  };
};

export const HistoryReducer = (state, action) => {

  switch (action.type) {
    case UNDO:
      return handleUndo(state);

    case REDO:
      return handleRedo(state);

    case SET:
      return handleSet(state, action);

    case RESET:
      return handleReset(action);

    default:
      return null;
  }
};
