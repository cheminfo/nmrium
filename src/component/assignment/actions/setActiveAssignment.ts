import { AssignmentState } from '../AssignmentsContext';
import { SetActiveAction } from '../AssignmentsReducer';

export default function setActiveAssignment(
  state: AssignmentState,
  action: SetActiveAction,
) {
  let { id, axis } = action.payload;
  const isActive = state.activated?.id === id;

  return {
    ...state,
    activated: !isActive ? { id, axis: axis || null } : null,
  };
}
