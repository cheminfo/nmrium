import { AssignmentState, Axis } from '../AssignmentsContext';
import { ToggleAction } from '../AssignmentsReducer';

import { removeAssignment } from './removeAssignment';

interface AddAction {
  id: string;
  atomID: string;
  axis: Axis;
}

function addAssignment(state: AssignmentState, action: AddAction) {
  const { id, atomID, axis } = action;

  const assignment = state.assignments?.[id]?.[axis] || [];

  // avoid duplicates
  if (!assignment.includes(id)) {
    assignment.push(atomID);
  }
}

export default function ToggleAssignments(
  state: AssignmentState,
  action: ToggleAction,
) {
  const newState = {
    ...state,
  };
  const { id, atomIDs: atomsKeys } = action.payload;
  const axis = state.activated?.axis;
  if (axis) {
    const atomIDs = state.assignments?.[id]?.[axis] || [];
    for (const atomID of atomsKeys) {
      if (!atomIDs.includes(id)) {
        addAssignment(newState, { axis, id, atomID });
      } else {
        removeAssignment(newState, { atomID, axis, id });
      }
    }
  }
  return state;
}
