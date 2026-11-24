import type { Range } from '@zakodium/nmr-types';

import type {
  AssignedSignal,
  AssignmentSignals,
  GetAssignmentSignalsOptions,
} from './types.js';

/**
 * Build each spectrum's ranges for a row, keeping only the row's signals and
 * write how many of the row's atoms each range is assigned to as its integration.
 */
export function getAssignmentSignals(
  options: GetAssignmentSignalsOptions,
): AssignmentSignals[] {
  const { row, groups, signalsByOclID, hydrogenIDsByParent } = options;
  const atomCountByOclID = new Map(
    groups.map(({ oclID, atoms }) => [oclID, atoms.length]),
  );

  // A signal appears under every group it is assigned to, so visiting the
  // row's groups accumulates exactly the row's atoms for that signal.
  const atomCounts = new Map<AssignedSignal, number>();
  for (const oclID of [row.id, ...(hydrogenIDsByParent.get(row.id) ?? [])]) {
    for (const entry of signalsByOclID.get(oclID) ?? []) {
      const atomCount = atomCountByOclID.get(oclID) ?? 0;
      atomCounts.set(entry, (atomCounts.get(entry) ?? 0) + atomCount);
    }
  }

  const assignmentsBySpectrum = new Map<string, AssignmentSignals>();
  const rowRangeBySource = new Map<Range, Range>();
  for (const [{ spectrum, range, signal }, atomCount] of atomCounts) {
    let assignment = assignmentsBySpectrum.get(spectrum.id);
    if (!assignment) {
      assignment = { spectrum, ranges: [] };
      assignmentsBySpectrum.set(spectrum.id, assignment);
    }
    let rowRange = rowRangeBySource.get(range);
    if (!rowRange) {
      rowRange = {
        ...range,
        signals: [],
        integration: 0,
        pubIntegral: undefined,
      };
      rowRangeBySource.set(range, rowRange);
      assignment.ranges.push(rowRange);
    }
    rowRange.signals.push(signal);
    rowRange.integration = (rowRange.integration ?? 0) + atomCount;
  }

  return Array.from(assignmentsBySpectrum.values());
}
