import { AssignmentState, Axis } from '..';

interface AddAction {
  id: string;
  atomID: string;
  axis: Axis;
}

export default function addAssignment(
  state: AssignmentState,
  action: AddAction,
) {
  const newState = {
    ...state,
  };
  const { id, atomID, axis } = action;

  const assignment = newState.assignment?.[id]?.[axis] || [];

  // avoid duplicates
  if (!assignment.includes(id)) {
    assignment.push(atomID);
  }

  return newState;
}
