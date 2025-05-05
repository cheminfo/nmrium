import type { Assignments } from '../AssignmentsContext.js';

export function filterAssignedIDs(
  assignments: Assignments,
  targetIDs: string[],
) {
  return targetIDs.filter((id) => id in assignments);
}
