import type { StateMolecule } from '@zakodium/nmrium-core';
import { readSDF } from '@zakodium/nmrium-core-plugins';
import { Molecule } from 'openchemlib';

import type { StateMoleculeExtended } from './Molecule.js';
import { initMolecule } from './Molecule.js';

//TODO: Move molecule initialization to nmrium-core and log an error if the molecule cannot be parsed.
export function fromJSON(
  mols: StateMolecule[],
  reservedMolecules: StateMolecule[] = [],
) {
  const reservedNumbers = extractLabelsNumbers(reservedMolecules.concat(mols));

  const molecules: StateMoleculeExtended[] = [];
  for (const mol of mols) {
    const {
      molfile,
      label = `P${getLabelNumber(reservedNumbers)}`,
      id,
      ...others
    } = mol;
    const moleculeOverride = {
      ...others,
      text: molfile,
      label,
      id,
    };
    try {
      molecules.push(initMolecule(moleculeOverride));
    } catch {
      continue;
    }
  }

  return molecules;
}

interface AddMolfileOptions {
  id?: string;
  label?: string;
}
export function addMolfile(
  molecules: StateMoleculeExtended[],
  molfile: string,
  options: AddMolfileOptions,
) {
  const { id, label } = options;
  const reservedNumbers = extractLabelsNumbers(molecules);

  // try to parse molfile
  // this will throw if the molecule can not be parsed !
  molecules.push(
    initMolecule({
      text: molfile,
      label: label ?? `P${getLabelNumber(reservedNumbers)}`,
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
  const _mol = initMolecule({
    text: molfile,
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

export const parseErrorMessage =
  'Failed to parse SMILES or molfile. Please paste a valid format';

function validateMolecules(molecules: StateMolecule[]) {
  if (!molecules?.length) {
    throw new Error(parseErrorMessage);
  }

  const failedIndexes: number[] = [];
  for (let i = 0; i < molecules.length; i++) {
    const { molfile } = molecules[i];
    const molecule = Molecule.fromMolfile(molfile);
    const atomCount = molecule.getAllAtoms();

    if (atomCount === 0) {
      failedIndexes.push(i);
    }
  }

  if (failedIndexes.length > 0) {
    throw new Error(
      `Error parsing molecule at position(s):[${failedIndexes.join(', ')}]. ${parseErrorMessage}`,
    );
  }
}

/**
 * We will extract the molecule(s) from the text.
 * Because a molfile is actually a SDF we can just call 'readSDF' method
 * @param text - text containing one or several molecules in SMILES, molfile or SDF format
 * @returns
 */

function parseSDF(text: string) {
  try {
    const molecules = readSDF(text);
    validateMolecules(molecules);
    return molecules;
  } catch (error) {
    throw new Error(parseErrorMessage, { cause: error });
  }
}

export function getMolecules(text?: string) {
  if (!text?.trim()) {
    throw new Error(parseErrorMessage);
  }

  const isSDF = /v[23]000/i.test(text);

  return isSDF ? parseSDF(text) : [initMolecule({ text })];
}
