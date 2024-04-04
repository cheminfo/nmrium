import { fileCollectionFromFiles } from 'filelist-utils';
import { read } from 'nmr-load-save';
import { Molecule as OCLMolecule } from 'openchemlib/full';

import { initMolecule, StateMolecule, StateMoleculeExtended } from './Molecule';

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
) {
  const reservedNumbers = extractLabelsNumbers(molecules);

  // try to parse molfile
  // this will throw if the molecule can not be parsed !
  const molecule = OCLMolecule.fromMolfile(molfile);
  molecules.push(
    initMolecule({
      molfile: molecule.toMolfileV3(),
      label: `P${getLabelNumber(reservedNumbers)}`,
    }),
  );
  // we will split if we have many fragments
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

  // we will split if we have many fragments
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

export function getLabelNumber(reserveNumbers: number[]): number {
  for (let i = 1; i < Number.MAX_VALUE; i++) {
    if (reserveNumbers.includes(i)) {
      continue;
    }

    return i;
  }

  return 1;
}

export async function getMolecules(text: string) {
  let extension = 'smi';

  if (/v[23]000/i.test(text)) {
    extension = 'sdf';
  }

  const file = new File([text], `file.${extension}`, {
    type: 'text/plain',
  });

  const collection = await fileCollectionFromFiles([file]);

  const {
    nmriumState: { data },
  } = await read(collection);
  return data?.molecules || [];
}
