import { Molecule } from 'openchemlib';
import type { DiaIDAndInfo } from 'openchemlib-utils';
import { useRef } from 'react';

import { useTopicMolecule } from '../../../context/TopicMoleculeContext.js';
import { sortAssignmentLabels } from '../utilities/sortAssignmentLabels.js';

function getLabels(labels: string[]) {
  return labels.map((label) => label.trim()).filter(Boolean);
}

function getCustomLabels(atomData: {
  customLabels?: string[];
  heavyAtomsCustomLabels?: string[];
}) {
  const { customLabels = [], heavyAtomsCustomLabels = [] } = atomData;
  return customLabels.length > 0 ? customLabels : heavyAtomsCustomLabels;
}

export function useExtractAtomAssignmentLabel() {
  const topicMolecule = useTopicMolecule();
  const lastHoverAtomIdRef = useRef<DiaIDAndInfo>(undefined);

  function getLastHoverAtom() {
    return lastHoverAtomIdRef.current;
  }

  function getTopicAtom(moleculeId: string, oclId: string, molfile?: string) {
    const baseMolecule = topicMolecule?.[moleculeId];

    if (!baseMolecule) return;

    const molecule = molfile
      ? baseMolecule.fromMolecule(Molecule.fromMolfile(molfile))
      : baseMolecule;

    const groupedDiaIdsMapping = molecule.getGroupedDiastereotopicAtomIDs();
    if (!Array.isArray(groupedDiaIdsMapping)) return;

    return groupedDiaIdsMapping.find((obj: any) => obj.oclID === oclId);
  }

  function getTopicAtomByHover(moleculeId: string, molfile?: string) {
    if (!lastHoverAtomIdRef.current) return;

    return getTopicAtom(moleculeId, lastHoverAtomIdRef.current.idCode, molfile);
  }

  function onAtomHover(atom: DiaIDAndInfo | undefined) {
    lastHoverAtomIdRef.current = atom;
  }

  function getAssignmentLabelById(
    moleculeId: string,
    oclID: string,
    molfile?: string,
  ) {
    const atomData = getTopicAtom(moleculeId, oclID, molfile);
    if (!atomData) return;

    return sortAssignmentLabels(getCustomLabels(atomData)).join(',');
  }

  function getAssignmentLabelByDiaIDs(diaIDs: string[]) {
    if (!diaIDs || diaIDs.length === 0) return;
    const moleculeObjects = Object.values(topicMolecule);
    const labels: string[] = [];

    for (const topicMoleculeObject of moleculeObjects) {
      const diaIDsObject = topicMoleculeObject.getDiaIDsObject();

      for (const diaID of diaIDs) {
        const atomData = diaIDsObject?.[diaID];
        if (atomData) {
          labels.push(...getCustomLabels(atomData));
        }
      }
    }

    const uniqueLabels = new Set(getLabels(labels));
    return sortAssignmentLabels([...uniqueLabels]).join(',');
  }

  function getAssignmentLabelByHover(moleculeId: string, molfile?: string) {
    const diaId = lastHoverAtomIdRef.current?.idCode;
    if (!diaId) return;
    return {
      assignment: getAssignmentLabelById(moleculeId, diaId, molfile),
      previousAssignment: getAssignmentLabelById(moleculeId, diaId),
    };
  }

  return {
    getAssignmentLabelByHover,
    getAssignmentLabelByDiaIDs,
    getAssignmentLabelById,
    onAtomHover,
    getLastHoverAtom,
    getTopicAtomByHover,
  };
}
