import type { Spectrum } from '@zakodium/nmrium-core';
import { isSpectrum1D, isSpectrum2DFt } from '@zakodium/nmrium-core';
import type { TopicMolecule } from 'openchemlib-utils';

import { getCouplingLength } from '../../../2d/linked-signals/utilities/getCouplingLength.js';
import { sortAssignmentLabels } from '../../MoleculesPanel/utilities/sortAssignmentLabels.js';

import type { AssignmentListRow } from './atomGroupsToAssignmentRows.js';

export interface LinkedAssignment {
  text: string;
  coupling?: { distance: number; labels: string };
}

type LinkedAssignmentsByOclID = Map<string, Map<string, LinkedAssignment>>;

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

function getAtomLabel(topicMolecule: TopicMolecule, atom: number): string {
  const molecule = topicMolecule.moleculeWithH;
  const label = molecule.getAtomCustomLabel(atom);
  const heavyAtomLabel =
    molecule.getAtomicNo(atom) === 1
      ? molecule.getAtomCustomLabel(molecule.getConnAtom(atom, 0))
      : undefined;
  return (label || heavyAtomLabel || '').replace(/^\]/, '').trim();
}

function getShortestAssignment(
  topicMolecule: TopicMolecule,
  xOclIDs: string[],
  yOclIDs: string[],
): ResolvedLinkAssignment | null {
  const distance = getCouplingLength(
    { selected: topicMolecule },
    xOclIDs,
    yOclIDs,
  );
  if (!distance) return null;

  const groups = topicMolecule.getDiaIDsObject();
  const matrix = topicMolecule.distanceMatrix;
  for (const xDiaID of xOclIDs) {
    for (const yDiaID of yOclIDs) {
      for (const xAtom of groups[xDiaID]?.atoms ?? []) {
        for (const yAtom of groups[yDiaID]?.atoms ?? []) {
          if (matrix[xAtom][yAtom] !== distance) continue;

          const xLabel = getAtomLabel(topicMolecule, xAtom);
          const yLabel = getAtomLabel(topicMolecule, yAtom);
          if (!xLabel || !yLabel) return null;
          const labels = `${xLabel} - ${yLabel}`;
          return {
            oclIDs: [xDiaID, yDiaID],
            assignment: {
              text: `${distance}J${labels}`,
              coupling: { distance, labels },
            },
          };
        }
      }
    }
  }
  return null;
}

interface ResolvedLinkAssignment {
  oclIDs: string[];
  assignment: LinkedAssignment;
}

/**
 * Decide what a single 2D link contributes to the summary:
 * the shortest coupling path when the molecule provides one,
 * otherwise the label saved on the link.
 */
function resolveLinkAssignment(
  topicMolecule: TopicMolecule,
  link: { xOclIDs: string[]; yOclIDs: string[]; assignment?: string },
): ResolvedLinkAssignment | null {
  const { xOclIDs, yOclIDs, assignment } = link;
  const shortest = getShortestAssignment(topicMolecule, xOclIDs, yOclIDs);
  if (shortest) return shortest;

  if (!assignment) return null;

  return { oclIDs: [...xOclIDs, ...yOclIDs], assignment: { text: assignment } };
}

/**
 * Group 2D correlations by experiment and the selected molecule's atom groups.
 */
export function getLinkedCorrelationsByExperiment(
  spectra: Spectrum[],
  topicMolecule: TopicMolecule,
): Map<string, LinkedAssignmentsByOclID> {
  const oclIDsBySignalId = getOclIDsBySignalId(spectra);
  const assignmentsByExperiment = new Map<string, LinkedAssignmentsByOclID>();

  for (const spectrum of spectra) {
    if (!isSpectrum2DFt(spectrum)) continue;

    const experiment = spectrum.info.experiment?.toUpperCase() || '2D';
    let assignmentsByOclID = assignmentsByExperiment.get(experiment);
    if (!assignmentsByOclID) {
      assignmentsByOclID = new Map();
      assignmentsByExperiment.set(experiment, assignmentsByOclID);
    }

    for (const link of spectrum.linkedSignals ?? []) {
      const resolved = resolveLinkAssignment(topicMolecule, {
        xOclIDs: oclIDsBySignalId.get(link.xSignalId) ?? [],
        yOclIDs: oclIDsBySignalId.get(link.ySignalId) ?? [],
        assignment: link.assignment,
      });
      if (!resolved) continue;
      addAssignmentToAtoms(
        assignmentsByOclID,
        resolved.oclIDs,
        resolved.assignment,
      );
    }
  }

  return assignmentsByExperiment;
}

function addAssignmentToAtoms(
  assignmentsByOclID: LinkedAssignmentsByOclID,
  oclIDs: string[],
  assignment: LinkedAssignment,
) {
  for (const oclID of oclIDs) {
    let assignments = assignmentsByOclID.get(oclID);
    if (!assignments) {
      assignments = new Map();
      assignmentsByOclID.set(oclID, assignments);
    }
    assignments.set(assignment.text, assignment);
  }
}

export function formatLinkedCorrelations(
  row: AssignmentListRow,
  assignmentsByOclID: LinkedAssignmentsByOclID,
  hydrogenIDsByParent: Map<string, string[]>,
): LinkedAssignment[] {
  const oclIDs = [row.id, ...(hydrogenIDsByParent.get(row.id) ?? [])];
  const assignments = new Map<string, LinkedAssignment>();

  for (const oclID of oclIDs) {
    for (const [text, assignment] of assignmentsByOclID.get(oclID) ?? []) {
      assignments.set(text, assignment);
    }
  }
  const assignmentKeys = Array.from(assignments.keys());
  return sortAssignmentLabels(assignmentKeys).flatMap((text) => {
    const assignment = assignments.get(text);
    return assignment ? [assignment] : [];
  });
}
