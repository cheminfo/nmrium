import type { Spectrum } from '@zakodium/nmrium-core';
import { isSpectrum1D, isSpectrum2DFt } from '@zakodium/nmrium-core';

import { sortAssignmentLabels } from '../../MoleculesPanel/utilities/sortAssignmentLabels.js';

import type { AssignmentListRow } from './atomGroupsToAssignmentRows.js';

export type LinkedAssignmentsByOclID = Map<string, Set<string>>;

function getOclIDsBySignalId(spectra: Spectrum[]): Map<string, string[]> {
  const oclIDsBySignalId = new Map<string, string[]>();

  for (const spectrum of spectra) {
    if (!isSpectrum1D(spectrum)) continue;

    for (const range of spectrum.ranges.values) {
      for (const signal of range.signals) {
        oclIDsBySignalId.set(signal.id, signal.diaIDs ?? []);
      }
    }
  }

  return oclIDsBySignalId;
}

/**
 * Group saved link text by experiment and atom group.
 * The 1D signals only identify which atom groups receive that text.
 */
export function getLinkedAssignmentsByExperiment(
  spectra: Spectrum[],
): Map<string, LinkedAssignmentsByOclID> {
  // 1. Map 1D signal IDs to the atom group IDs used by table rows.
  // Map {
  //   'signal-h1' => ['atom-H1'],
  //   'signal-c2' => ['atom-C2'],
  // }
  const oclIDsBySignalId = getOclIDsBySignalId(spectra);
  const assignmentsByExperiment = new Map<string, LinkedAssignmentsByOclID>();

  for (const spectrum of spectra) {
    if (!isSpectrum2DFt(spectrum)) continue;

    // 2. Create or reuse the atom lookup for this experiment's table column.
    const experiment = spectrum.info.experiment?.toUpperCase() || '2D';
    let assignmentsByOclID = assignmentsByExperiment.get(experiment);
    if (!assignmentsByOclID) {
      assignmentsByOclID = new Map();
      assignmentsByExperiment.set(experiment, assignmentsByOclID);
    }

    // 3. Associate the saved assignment with atom groups on each axis.
    // Example link: signal-h1 -> signal-c2, assignment: 'H1,C2'.
    // Output: Map {
    //   'HSQC' => Map {
    //     'atom-H1' => Set { 'H1,C2' },
    //     'atom-C2' => Set { 'H1,C2' },
    //   },
    // }
    for (const link of spectrum.linkedSignals ?? []) {

      const { xSignalId, ySignalId, assignment } = link;

      if (!assignment) continue;

      const xOclIDs = oclIDsBySignalId.get(xSignalId) ?? [];
      const yOclIDs = oclIDsBySignalId.get(ySignalId) ?? [];
      addAssignmentToAtoms(assignmentsByOclID, xOclIDs, assignment);
      addAssignmentToAtoms(assignmentsByOclID, yOclIDs, assignment);
    }
  }

  return assignmentsByExperiment;
}

function addAssignmentToAtoms(
  assignmentsByOclID: LinkedAssignmentsByOclID,
  oclIDs: string[],
  assignment: string,
) {
  for (const oclID of oclIDs) {
    const assignments = assignmentsByOclID.get(oclID);
    if (assignments) {
      assignments.add(assignment);
    } else {
      assignmentsByOclID.set(oclID, new Set([assignment]));
    }
  }
}

export function formatLinkedAssignments(
  row: AssignmentListRow,
  assignmentsByOclID: LinkedAssignmentsByOclID,
  hydrogenIDsByParent: ReadonlyMap<string, readonly string[]>,
): string {
  const oclIDs = [row.id, ...(hydrogenIDsByParent.get(row.id) ?? [])];
  const assignments = new Set<string>();

  for (const oclID of oclIDs) {
    for (const assignment of assignmentsByOclID.get(oclID) ?? []) {
      assignments.add(assignment);
    }
  }

  return sortAssignmentLabels(Array.from(assignments)).join(', ');
}
