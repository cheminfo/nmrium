import type { AssignmentState } from '../AssignmentsContext.js';
import type { SetActiveAction } from '../AssignmentsReducer.js';

export default function setActiveAssignment(
  state: AssignmentState,
  action: SetActiveAction,
) {
  const { id, axis } = action.payload;
  const isActive = state.activated?.id === id;

  return {
    ...state,
    activated: !isActive ? { id, axis: axis || null } : null,
  };
}
