import { AssignmentContext } from '../AssignmentsContext';

export function filterForIDsWithAssignment(
  assignmentData: AssignmentContext,
  ids: string[],
) {
  return ids.filter((id) =>
    Object.keys(assignmentData.data).filter((_id) => _id === id),
  );
}
