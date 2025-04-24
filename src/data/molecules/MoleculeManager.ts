import { readSDF, readSMILES } from 'nmrium-core-plugins';
import { Molecule as OCLMolecule } from 'openchemlib/full';

import type { StateMolecule, StateMoleculeExtended } from './Molecule.js';
import { initMolecule } from './Molecule.js';

export function fromJSON(
  mols: StateMolecule[],
  reservedMolecules: StateMolecule[] = [],
) {
  const reservedNumbers = extractLabelsNumbers(reservedMolecules.concat(mols));

  const molecules: StateMoleculeExtended[] = [];
  for (const mol of mols) {
    const molecule = OCLMolecule.fromMolfile(mol.molfile);
    molecules.push(
      initMolecule({
        molfile: molecule.toMolfileV3(),
        label: mol.label || `P${getLabelNumber(reservedNumbers)}`,
        id: mol.id,
      }),
    );
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
  const molecule = OCLMolecule.fromMolfile(molfile);
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
  const molecule = OCLMolecule.fromMolfile(molfile);
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

export function getMolecules(text: string) {
  // parse SDF
  if (/v[23]000/i.test(text)) {
    return readSDF(text);
  }
  return readSMILES(text);
}
