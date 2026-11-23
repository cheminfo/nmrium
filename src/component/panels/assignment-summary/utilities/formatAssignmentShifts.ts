import { formatNumber } from '../../../utility/formatNumber.js';

import type { AssignmentSignals } from './types.js';

interface FormatAssignmentShiftsOptions {
  assignment: AssignmentSignals;
  deltaFormat: string;
}

/**
 * Sort and format signal deltas without adding spectrum details or units.
 * @returns Shift values joined with ', '
 */
export function formatAssignmentShifts(
  options: FormatAssignmentShiftsOptions,
): string {
  const { assignment, deltaFormat } = options;
  const deltas = assignment.ranges.flatMap(({ signals }) =>
    signals.map(({ delta }) => delta),
  );

  return deltas
    .toSorted((a, b) => a - b)
    .map((delta) => formatNumber(delta, deltaFormat))
    .join(', ');
}
