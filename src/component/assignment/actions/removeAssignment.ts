import { AssignmentState, Axis } from '../AssignmentsContext';

interface RemoveAction {
  ids: string[];
  atomID?: string;
  axis: Axis;
}

interface AssignmentRemoveOptions extends Omit<RemoveAction, 'ids'> {
  id: string;
}

export function removeAssignment(
  state: AssignmentState,
  options: AssignmentRemoveOptions,
) {
  const { id, atomID = '', axis } = options;

  const atomIDs = state.assignments?.[id]?.[axis] || null;

  if (atomIDs) {
    if (atomID) {
      atomIDs.filter((id) => id !== atomID);
      state.assignments[id][axis] = atomIDs;
    } else {
      state.assignments[id][axis] = [];
    }
  }
}

export default function removeAssignments(
  state: AssignmentState,
  action: RemoveAction,
) {
  const newState = {
    ...state,
  };
  // signal id
  const { ids, atomID = '', axis } = action;
  for (const id of ids) {
    removeAssignment(newState, { id, atomID, axis });
  }
  return newState;
}
