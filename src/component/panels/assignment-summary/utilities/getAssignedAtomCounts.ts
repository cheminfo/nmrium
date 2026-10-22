import type { GroupedDiaID } from 'openchemlib-utils';

import type { AssignedAtomCounts, SignalsByOclID } from './types.js';

/**
 * Count atoms of the nucleus's element in the selected molecule.
 * The lookup must belong to that nucleus. Counts measure assignment coverage,
 * not the number of signals or whether the assignments have been verified.
 */
export function getAssignedAtomCounts(
  groups: GroupedDiaID[],
  signalsByOclID: SignalsByOclID,
  nucleus: string,
): AssignedAtomCounts {
  let assigned = 0;
  let total = 0;
  const atomLabel = nucleus.replace(/^\d+/, '');

  for (const group of groups) {
    if (group.atomLabel !== atomLabel) continue;

    // Count individual equivalent atoms (for example, 3 H in a methyl group),
    // not one atom per group. The total is independent of observed signals.
    total += group.atoms.length;
    // A group counts once if assigned in any spectrum of this nucleus.
    if (signalsByOclID.has(group.oclID)) {
      assigned += group.atoms.length;
    }
  }

  return { assigned, total };
}
