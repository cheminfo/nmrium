import { Molecule } from 'openchemlib';
import type { DiaIDAndInfo } from 'openchemlib-utils';
import { useRef } from 'react';

import { useTopicMolecule } from '../../../context/TopicMoleculeContext.js';

export function useExtractAtomAssignmentLabel() {
  const topicMolecule = useTopicMolecule();
  const lastHoverAtomIdRef = useRef<DiaIDAndInfo>();

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

    const { customLabels = [], heavyAtomsCustomLabels = [] } = atomData;
    const labels =
      customLabels.length > 0 ? customLabels : heavyAtomsCustomLabels;

    const uniqueLabels = [
      ...new Set(labels.map((l: string) => l.trim()).filter(Boolean)),
    ];
    return uniqueLabels.join(',');
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
    getAssignmentLabelById,
    onAtomHover,
    getLastHoverAtom,
    getTopicAtomByHover,
  };
}
