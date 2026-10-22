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
  const { entries } = assignment;

  return entries
    .map(({ signal }) => signal.delta)
    .toSorted((a, b) => a - b)
    .map((delta) => formatNumber(delta, deltaFormat))
    .join(', ');
}
