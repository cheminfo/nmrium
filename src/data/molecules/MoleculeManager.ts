import { Molecule as OCLMolecule } from 'openchemlib/full';

import { initMolecule, Molecule } from './Molecule';

export function fromJSON(mols: any[] = []) {
  const reservedNumbers = extractLabelsNumbers(mols);

  const molecules: Molecule[] = [];
  for (const mol of mols) {
    const molecule = OCLMolecule.fromMolfile(mol.molfile);
    const fragments = molecule.getFragments();
    for (let fragment of fragments) {
      molecules.push(
        initMolecule({
          molfile: fragment.toMolfileV3(),
          label: mol.label ? mol.label : `P${getLabelNumber(reservedNumbers)}`,
        }),
      );
    }
  }

  return molecules;
}

export function addMolfile(molecules, molfile) {
  const reservedNumbers = extractLabelsNumbers(molecules);

  // try to parse molfile
  // this will throw if the molecule can not be parsed !
  const molecule = OCLMolecule.fromMolfile(molfile);
  let fragments = molecule.getFragments();
  for (let fragment of fragments) {
    molecules.push(
      initMolecule({
        molfile: fragment.toMolfileV3(),
        label: `P${getLabelNumber(reservedNumbers)}`,
      }),
    );
  }
  // we will split if we have many fragments
}

export function setMolfile(
  molecules,
  currentMolecule: Pick<Molecule, 'id' | 'molfile' | 'label'>,
) {
  const { molfile, id, label } = currentMolecule;
  const reservedNumbers = extractLabelsNumbers(molecules);

  // try to parse molfile
  // this will throw if the molecule can not be parsed !
  let molecule = OCLMolecule.fromMolfile(molfile);
  let fragments = molecule.getFragments();

  if (fragments.length > 1) {
    molecules = molecules.filter((m) => m.id !== id);

    for (let fragment of fragments) {
      molecules.push(
        initMolecule({
          molfile: fragment.toMolfileV3(),
          label: `P${getLabelNumber(reservedNumbers)}`,
        }),
      );
    }
  } else if (fragments.length === 1) {
    const fragment = fragments[0];
    const _mol = initMolecule({
      molfile: fragment.toMolfileV3(),
      id,
      label,
    });
    let molIndex = molecules.findIndex((m) => m.id === id);
    molecules.splice(molIndex, 1, _mol);
  }

  // we will split if we have many fragments
}

export function extractNumber(value: string) {
  return /(?<number>\d+)/.exec(value)?.groups?.number || null;
}

export function extractLabelsNumbers(molecules: Molecule[]) {
  const values: number[] = [];
  for (const molecule of molecules) {
    const value = extractNumber(molecule.label);
    if (value) {
      values.push(Number(value));
    }
  }
  return values;
}

export function getLabelNumber(reserveNumbers: number[]): number {
  for (let i = 1; i < Number.MAX_VALUE; i++) {
    if (reserveNumbers.includes(i)) {
      continue;
    }

    return i;
  }

  return 1;
}
