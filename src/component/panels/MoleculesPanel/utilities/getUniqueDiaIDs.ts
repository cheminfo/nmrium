import type { AtomData } from './AtomData.ts';

export function getUniqueDiaIDs(diaIDs: string[], atomInformation: AtomData) {
  // a previous version of the code prevented to assign many time the same atom
  // see revision cc13abc18f77b6787b923e3c4edaef51750d9e90
  const { nbAtoms, oclIDs } = atomInformation;

  const diaIDSet = new Set(diaIDs);
  let tempNbAtoms: number = nbAtoms;

  for (const oclID of oclIDs) {
    if (diaIDSet.has(oclID)) {
      tempNbAtoms *= -1;
      diaIDSet.delete(oclID);
    } else {
      diaIDSet.add(oclID);
    }
  }
  return { diaIDs: Array.from(diaIDSet), nbAtoms: tempNbAtoms };
}
