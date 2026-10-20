import type { GroupedDiaID } from 'openchemlib-utils';

import { sortAssignmentLabels } from '../MoleculesPanel/utilities/sortAssignmentLabels.js';

/**
 * Controls which atoms show their attached hydrogens in the table.
 * - `true`: show hydrogens beneath every atom group.
 * - `false`: hide all hydrogen rows.
 * - A set of group IDs: show hydrogens only beneath the selected groups.
 * Hydrogens without a matching parent remain visible unless this is `false`.
 */
export type AssignmentExpansion = boolean | ReadonlySet<string>;

export interface AssignmentListRow {
  /**
   * The atom group's oclID, used to look up signal assignments.
   */
  id: string;
  parentOclId?: string;
  atomLabel: string;
  atomNumbers: string;
  atomLabels: string;
  isHydrogen: boolean;
  hasChildren: boolean;
  isExpanded: boolean;
}

interface AssignmentRowOptions {
  /**
   * ID of the atom group this hydrogen row appears beneath.
   */
  parentOclId?: string;
  hasChildren?: boolean;
  isExpanded?: boolean;
}

export function getHydrogenIDsByParent(
  rows: readonly AssignmentListRow[],
): ReadonlyMap<string, readonly string[]> {
  const hydrogenIDsByParent = new Map<string, string[]>();
  for (const row of rows) {
    if (row.parentOclId === undefined) continue;
    const hydrogenIDs = hydrogenIDsByParent.get(row.parentOclId);
    if (hydrogenIDs) {
      hydrogenIDs.push(row.id);
    } else {
      hydrogenIDsByParent.set(row.parentOclId, [row.id]);
    }
  }
  return hydrogenIDsByParent;
}

interface HydrogenPartition {
  /**
   * The attached hydrogen groups to display beneath each atom group.
   */
  hydrogensByParentOclId: Map<string, GroupedDiaID[]>;
  /**
   * Hydrogen groups that could not be matched to an atom group.
   */
  unattachedHydrogens: GroupedDiaID[];
}

function isHydrogenGroup(group: GroupedDiaID): boolean {
  return group.atomLabel === 'H';
}

function compareByFirstAtomIndex(a: GroupedDiaID, b: GroupedDiaID): number {
  // Keep groups in molecule order using the first atom number in each group.
  return a.atoms[0] - b.atoms[0];
}

function compareNumbers(a: number, b: number): number {
  return a - b;
}

function isGroupExpanded(
  expansion: AssignmentExpansion,
  parentOclId: string,
): boolean {
  return typeof expansion === 'boolean'
    ? expansion
    : expansion.has(parentOclId);
}

function toAssignmentRow(
  group: GroupedDiaID,
  options: AssignmentRowOptions = {},
): AssignmentListRow {
  const { parentOclId, hasChildren = false, isExpanded = false } = options;

  return {
    id: group.oclID,
    parentOclId,
    atomLabel: group.atomLabel,
    atomNumbers: group.atoms.toSorted(compareNumbers).join(','),
    atomLabels: sortAssignmentLabels(group.customLabels).join(','),
    isHydrogen: isHydrogenGroup(group),
    hasChildren,
    isExpanded,
  };
}

/**
 * Find which atom group each hydrogen group belongs beneath.
 * A "heavy atom" means any atom other than hydrogen.
 *
 * Use the molecule's atom numbers to find attachments.
 * First record the group containing each heavy atom, then use that record to place the hydrogens without repeated searches.
 * Each heavy atom is expected to belong to only one group.
 */
function partitionHydrogenGroups(
  heavyAtomGroups: readonly GroupedDiaID[],
  hydrogenGroups: readonly GroupedDiaID[],
): HydrogenPartition {
  const heavyGroupByAtomIndex = new Map<number, GroupedDiaID>();
  for (const heavyGroup of heavyAtomGroups) {
    for (const atomIndex of heavyGroup.atoms) {
      heavyGroupByAtomIndex.set(atomIndex, heavyGroup);
    }
  }

  const hydrogensByParentOclId = new Map<string, GroupedDiaID[]>();
  const unattachedHydrogens: GroupedDiaID[] = [];

  for (const hydrogenGroup of hydrogenGroups) {
    // Several attached atoms may share one group; show its hydrogen row only once.
    const parentGroups = new Set<GroupedDiaID>();
    for (const heavyAtomIndex of hydrogenGroup.heavyAtoms) {
      const parentGroup = heavyGroupByAtomIndex.get(heavyAtomIndex);
      if (parentGroup) parentGroups.add(parentGroup);
    }

    if (parentGroups.size === 0) {
      unattachedHydrogens.push(hydrogenGroup);
      continue;
    }

    for (const parentGroup of parentGroups) {
      const siblings = hydrogensByParentOclId.get(parentGroup.oclID);
      if (siblings) {
        siblings.push(hydrogenGroup);
      } else {
        hydrogensByParentOclId.set(parentGroup.oclID, [hydrogenGroup]);
      }
    }
  }

  return { hydrogensByParentOclId, unattachedHydrogens };
}

/**
 * Prepare the rows shown in the assignment list.
 *
 * Input comes from `TopicMolecule.getGroupedDiastereotopicAtomIDs()`.
 * Each group describes equivalent atoms that belong in the same table row:
 * - `oclID`: the group's identifier.
 * - `atomLabel`: the element symbol, such as C or H.
 * - `atoms`: the atom numbers in this group, starting at zero.
 * - `customLabels`: custom names assigned to these atoms, such as "3a".
 * - `heavyAtoms`: for hydrogens, the numbers of the atoms they are attached to.
 *
 * The table lists each heavy-atom group, followed by its hydrogen groups when
 * expanded.
 * for example:
 *   Input: carbon c1 contains atom 0, carbon c2 contains atom 1, and hydrogen group h1 contains atoms 2, 3, 4 attached to atom 0.
 *   atomGroupsToAssignmentRows(groups, new Set(['c1']));
 *  Output table:
 *  Atom | Atom numbers
 *  C    | 0
 *    H  | 2,3,4
 *  C    | 1
 */
export function atomGroupsToAssignmentRows(
  groups: readonly GroupedDiaID[],
  expansion: AssignmentExpansion,
): AssignmentListRow[] {
  // 1. Put groups in molecule order and separate hydrogens from other atoms.
  const sortedGroups = groups.toSorted(compareByFirstAtomIndex);
  const heavyAtomGroups = sortedGroups.filter(
    (group) => !isHydrogenGroup(group),
  );
  const hydrogenGroups = sortedGroups.filter(isHydrogenGroup);

  // 2. Find the parent groups for the hydrogens.
  const { hydrogensByParentOclId, unattachedHydrogens } =
    partitionHydrogenGroups(heavyAtomGroups, hydrogenGroups);

  const rows: AssignmentListRow[] = [];

  // 3. Add each parent, followed by its hydrogens if the row is expanded.
  for (const parentGroup of heavyAtomGroups) {
    const childHydrogens = hydrogensByParentOclId.get(parentGroup.oclID) ?? [];
    const hasChildren = childHydrogens.length > 0;
    const isExpanded =
      hasChildren && isGroupExpanded(expansion, parentGroup.oclID);

    rows.push(
      toAssignmentRow(parentGroup, {
        hasChildren,
        isExpanded,
      }),
    );

    if (isExpanded) {
      for (const hydrogenGroup of childHydrogens) {
        rows.push(
          toAssignmentRow(hydrogenGroup, { parentOclId: parentGroup.oclID }),
        );
      }
    }
  }

  // Currently this case is not exits but it is a fallback for any unattached hydrogens.
  // 4. Keep unmatched hydrogens at the end so they are not lost from the list.
  if (expansion !== false) {
    for (const hydrogenGroup of unattachedHydrogens) {
      rows.push(toAssignmentRow(hydrogenGroup));
    }
  }

  return rows;
}
