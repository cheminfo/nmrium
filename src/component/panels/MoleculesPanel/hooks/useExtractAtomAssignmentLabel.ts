import { Molecule } from 'openchemlib';
import type { DiaIDAndInfo } from 'openchemlib-utils';
import { useRef } from 'react';

import { useTopicMolecule } from '../../../context/TopicMoleculeContext.js';

function getUniqueLabels(labels: string[]) {
  return [...new Set(labels.map((label) => label.trim()).filter(Boolean))];
}

function getCustomLabels(atomData: {
  customLabels?: string[];
  heavyAtomsCustomLabels?: string[];
}) {
  const { customLabels = [], heavyAtomsCustomLabels = [] } = atomData;
  return customLabels.length > 0 ? customLabels : heavyAtomsCustomLabels;
}

function getCustomLabel(atomData: {
  customLabels?: string[];
  heavyAtomsCustomLabels?: string[];
}) {
  return getCustomLabels(atomData).find((label) => label.trim());
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

    const uniqueLabels = getUniqueLabels(getCustomLabels(atomData));
    return uniqueLabels.join(',');
  }

  function getAssignmentLabelByDiaIDs(diaIDs: string[]) {
    if (!diaIDs || diaIDs.length === 0) return;
    const moleculeObjects = Object.values(topicMolecule);
    for (const topicMoleculeObject of moleculeObjects) {
      const diaIDsObject = topicMoleculeObject.getDiaIDsObject();

      for (const diaID of diaIDs) {
        const atomData = diaIDsObject?.[diaID];
        if (!atomData) continue;

        const label = getCustomLabel(atomData);
        if (label) return label;
      }
    }

    return undefined;
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
