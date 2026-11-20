import type { TopicMolecule } from 'openchemlib-utils';

export function getCouplingLength(
  topicMolecules: Record<string, TopicMolecule>,
  xDiaIDs: string[],
  yDiaIDs: string[],
): number | null {
  const candidates = getCouplingCandidates(topicMolecules, xDiaIDs, yDiaIDs);
  if (candidates.length === 0) return null;
  return Math.min(...candidates.map((c) => c.distance));
}

interface CouplingCandidate {
  moleculeId: string;
  xDiaID: string;
  yDiaID: string;
  xAtom: number;
  yAtom: number;
  distance: number;
}

function getCouplingCandidates(
  topicMolecules: Record<string, TopicMolecule>,
  xDiaIDs: string[],
  yDiaIDs: string[],
): CouplingCandidate[] {
  const couplingCandidate: CouplingCandidate[] = [];
  if (xDiaIDs.length === 0 || yDiaIDs.length === 0) return couplingCandidate;

  for (const [moleculeId, topicMolecule] of Object.entries(topicMolecules)) {
    const diaIDsObject = topicMolecule.getDiaIDsObject();
    for (const x of xDiaIDs) {
      const xGroup = diaIDsObject[x];
      if (!xGroup) continue;
      for (const y of yDiaIDs) {
        const yGroup = diaIDsObject[y];
        if (!yGroup) continue;

        for (const xAtom of xGroup.atoms) {
          for (const yAtom of yGroup.atoms) {
            const distance = topicMolecule.distanceMatrix[xAtom][yAtom];
            if (distance >= 0) {
              couplingCandidate.push({
                moleculeId,
                xDiaID: x,
                yDiaID: y,
                xAtom,
                yAtom,
                distance,
              });
            }
          }
        }
      }
    }
  }
  return couplingCandidate;
}
