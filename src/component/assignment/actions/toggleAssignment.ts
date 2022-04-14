import {
  AssignmentDimension,
  AssignmentState,
  Axis,
} from '../AssignmentsContext';
import { ToggleAction } from '../AssignmentsReducer';

import { removeAssignment } from './removeAssignment';

interface AddAction {
  id: string;
  atomID: string;
  axis: Axis;
  dimension: AssignmentDimension;
}

function addAssignment(state: AssignmentState, action: AddAction) {
  const { id, atomID, axis, dimension } = action;

  const assignment = state.assignments?.[id] || null;
  const axisAssignments = assignment?.[axis] || null;

  // avoid duplicates
  if (axisAssignments) {
    if (!axisAssignments.includes(id)) {
      axisAssignments.push(atomID);
    }
  } else {
    const otherAxis = axis === 'x' ? 'y' : 'x';
    state.assignments = {
      ...state.assignments,
      [id]: {
        ...state.assignments[id],
        [axis]: [atomID],
        ...(dimension === '2D' && {
          [otherAxis]: assignment?.[otherAxis] ? assignment[otherAxis] : [],
        }),
      },
    };
  }
}

export default function ToggleAssignments(
  state: AssignmentState,
  action: ToggleAction,
) {
  const newState = {
    ...state,
  };
  const { id, atomIDs: atomsKeys, dimension } = action.payload;
  const axis = state.activated?.axis;
  if (axis) {
    const atomIDs = state.assignments?.[id]?.[axis] || [];

    for (const atomID of atomsKeys) {
      if (!atomIDs.includes(id)) {
        addAssignment(newState, { axis, id, atomID, dimension });
      } else {
        removeAssignment(newState, { atomID, axis, id });
      }
    }
  }
  return newState;
}
