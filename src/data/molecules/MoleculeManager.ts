import type { StateMolecule } from '@zakodium/nmrium-core';
import { readSDF, readSMILES } from '@zakodium/nmrium-core-plugins';
import { Molecule } from 'openchemlib';

import type { StateMoleculeExtended } from './Molecule.js';
import { initMolecule } from './Molecule.js';

//TODO: Move molecule initialization to nmrium-core and log an error if the molecule cannot be parsed.
export function fromJSON(
  mols: StateMolecule[],
  fileCollectionId: string | undefined,
  reservedMolecules: StateMolecule[] = [],
) {
  const reservedNumbers = extractLabelsNumbers(reservedMolecules.concat(mols));

  const molecules: StateMoleculeExtended[] = [];
  for (const mol of mols) {
    const molecule = Molecule.fromMolfile(mol.molfile);

    const atomCount = molecule.getAllAtoms();

    if (atomCount === 0) {
      continue;
    }

    const moleculeOverride = {
      ...mol,
      molfile: molecule.toMolfileV3(),
      label: mol.label || `P${getLabelNumber(reservedNumbers)}`,
      id: mol.id,
    };
    if (fileCollectionId) {
      moleculeOverride.fileCollectionId = fileCollectionId;
    }

    molecules.push(initMolecule(moleculeOverride));
  }

  return molecules;
}

export function addMolfile(
  molecules: StateMoleculeExtended[],
  molfile: string,
  id?: string,
) {
  const reservedNumbers = extractLabelsNumbers(molecules);

  // try to parse molfile
  // this will throw if the molecule can not be parsed !
  const molecule = Molecule.fromMolfile(molfile);
  molecules.push(
    initMolecule({
      molfile: molecule.toMolfileV3(),
      label: `P${getLabelNumber(reservedNumbers)}`,
      id,
    }),
  );
}

export function setMolfile(
  molecules: StateMoleculeExtended[],
  currentMolecule: StateMolecule,
) {
  const { molfile, id, label } = currentMolecule;
  // try to parse molfile
  // this will throw if the molecule can not be parsed !
  const molecule = Molecule.fromMolfile(molfile);
  const _mol = initMolecule({
    molfile: molecule.toMolfileV3(),
    id,
    label,
  });
  const molIndex = molecules.findIndex((m) => m.id === id);
  molecules.splice(molIndex, 1, _mol);
}

export function extractNumber(value: string) {
  return /(?<number>\d+)/.exec(value)?.groups?.number || null;
}

export function extractLabelsNumbers(
  molecules: Array<Pick<StateMolecule, 'label'>>,
) {
  const values: number[] = [];
  for (const molecule of molecules) {
    const value = extractNumber(molecule?.label || '');
    if (value) {
      values.push(Number(value));
    }
  }
  return values;
}

function getLabelNumber(reserveNumbers: number[]): number {
  for (let i = 1; i < Number.MAX_VALUE; i++) {
    if (reserveNumbers.includes(i)) {
      continue;
    }

    return i;
  }

  return 1;
}

/**
 * We will extract the molecule(s) from the text.
 * Because a molfile is actually a SDF we can just call 'readSDF' method
 * @param text - text containing one or several molecules in SMILES, molfile or SDF format
 * @returns
 */
export function getMolecules(text: string) {
  // parse SDF
  if (/v[23]000/i.test(text)) {
    return readSDF(text);
  }
  return readSMILES(text);
}
