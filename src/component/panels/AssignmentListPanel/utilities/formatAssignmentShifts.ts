import { formatNumber } from '../../../utility/formatNumber.js';

import { assignmentACSOptions } from './assignmentACSOptions.js';
import type { FormatAssignmentOptions } from './types.js';

/**
 * Sort and format signal deltas without adding spectrum details or units.
 * @returns Shift values joined with ', '
 */
export function formatAssignmentShifts(
  options: FormatAssignmentOptions,
): string {
  const { entries } = options.assignment;
  const acs = { ...options.acs, ...assignmentACSOptions };

  return entries
    .map(({ signal }) => signal.delta)
    .toSorted((a, b) => (acs.ascending ? a - b : b - a))
    .map((delta) => formatNumber(delta, acs.deltaFormat))
    .join(', ');
}
