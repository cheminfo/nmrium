import type { LinkedAssignment } from '../utilities/getLinkedCorrelationsByExperiment.js';

interface AssignmentCorrelationCellProps {
  assignments: LinkedAssignment[];
}

export function AssignmentCorrelationCell({
  assignments,
}: AssignmentCorrelationCellProps) {
  return assignments.map((assignment, index) => (
    <span key={assignment.text}>
      {index > 0 && ', '}
      {assignment.coupling ? (
        <>
          <sup>{assignment.coupling.distance}</sup>J
          <sub>{assignment.coupling.labels}</sub>
        </>
      ) : (
        assignment.text
      )}
    </span>
  ));
}
