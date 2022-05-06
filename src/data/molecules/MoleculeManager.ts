import { Molecule as OCLMolecule } from 'openchemlib/full';

import { initMolecule, Molecule } from './Molecule';

export function fromJSON(mols: any[] = []) {
  const molecules: Molecule[] = [];
  for (const mol of mols) {
    const molecule = OCLMolecule.fromMolfile(mol.molfile);
    const fragments = molecule.getFragments();
    for (let fragment of fragments) {
      molecules.push(
        initMolecule({
          molfile: fragment.toMolfileV3(),
        }),
      );
    }
  }

  return molecules;
}

export function addMolfile(molecules, molfile) {
  // try to parse molfile
  // this will throw if the molecule can not be parsed !
  const molecule = OCLMolecule.fromMolfile(molfile);
  let fragments = molecule.getFragments();
  for (let fragment of fragments) {
    molecules.push(
      initMolecule({
        molfile: fragment.toMolfileV3(),
      }),
    );
  }
  // we will split if we have many fragments
}

export function setMolfile(molecules, molfile, key) {
  // try to parse molfile
  // this will throw if the molecule can not be parsed !
  let molecule = OCLMolecule.fromMolfile(molfile);
  let fragments = molecule.getFragments();

  if (fragments.length > 1) {
    molecules = molecules.filter((m) => m.key !== key);

    for (let fragment of fragments) {
      molecules.push(
        initMolecule({
          molfile: fragment.toMolfileV3(),
        }),
      );
    }
  } else if (fragments.length === 1) {
    const fragment = fragments[0];
    const _mol = initMolecule({
      isFloat: true,
      molfile: fragment.toMolfileV3(),
      key: key,
    });
    let molIndex = molecules.findIndex((m) => m.key === key);
    molecules.splice(molIndex, 1, _mol);
  }

  // we will split if we have many fragments
}
