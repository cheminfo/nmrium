import { AssignmentState, Axis } from '../AssignmentsContext';

interface RemoveAction {
  ids: string[];
  atomID?: string;
  axis: Axis;
}

export default function removeAssignment(
  state: AssignmentState,
  action: RemoveAction,
) {
  const newState = {
    ...state,
  };
  // signal id
  const { ids, atomID = '', axis } = action;
  for (const id of ids) {
    const atomIDs = state.assignment?.[id]?.[axis] || null;

    if (atomIDs) {
      if (atomID) {
        atomIDs.filter((id) => id !== atomID);
        newState.assignment[id][axis] = atomIDs;
      } else {
        newState.assignment[id][axis] = [];
      }
    }
  }
  return newState;
}
