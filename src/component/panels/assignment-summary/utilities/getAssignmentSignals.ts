import type {
  AssignedSignal,
  AssignmentSignals,
  AssignmentSpectrum,
  GetAssignmentSignalsOptions,
} from './types.js';

/**
 * Collect a row's signals and those of its attached hydrogen groups.
 *
 * @param options - The row (`row.id` is its OCL ID), nucleus-specific signal
 * lookup, precomputed parent-to-hydrogen lookup, and optional spectrum ID.
 * @returns One group per matching spectrum, with duplicate entries removed when
 * the same signal matches several OCL IDs.
 */
export function getAssignmentSignals(
  options: GetAssignmentSignalsOptions,
): AssignmentSignals[] {
  const { row, signalsByOclID, hydrogenIDsByParent, spectrumId } = options;
  // Include attached H assignments on the parent row even when H rows are hidden.
  const oclIDs = [row.id, ...(hydrogenIDsByParent.get(row.id) ?? [])];
  const signalsBySpectrum = new Map<
    string,
    { spectrum: AssignmentSpectrum; signals: Set<AssignedSignal> }
  >();

  for (const oclID of oclIDs) {
    for (const entry of signalsByOclID.get(oclID) ?? []) {
      if (spectrumId !== undefined && entry.spectrum.id !== spectrumId) {
        continue;
      }
      let group = signalsBySpectrum.get(entry.spectrum.id);

      if (!group) {
        group = { spectrum: entry.spectrum, signals: new Set() };
        signalsBySpectrum.set(entry.spectrum.id, group);
      }
      // A signal linked to several of this row's groups should appear only once.
      group.signals.add(entry);
    }
  }

  return Array.from(signalsBySpectrum.values(), (group) => {
    const entries = Array.from(group.signals);
    return {
      spectrum: group.spectrum,
      entries,
    };
  });
}
