import type { AssignmentContext } from '../../../assignment/AssignmentsContext.ts';

export function getCurrentDiaIDsToHighlight(assignmentData: AssignmentContext) {
  const { highlighted, data } = assignmentData;
  const assignment = highlighted ? data[highlighted.id] : null;
  const axisHover = highlighted ? highlighted.axis : null;
  if (axisHover && assignment?.[axisHover]) {
    return assignment[axisHover];
  } else {
    return (assignment?.x || []).concat(assignment?.y || []);
  }
}
