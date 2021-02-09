import { Molecule as OCLMolecule } from 'openchemlib/full';

import { initMolecule } from './Molecule';

export function fromJSON(mols = []) {
  const molecules = [];
  for (let i = 0; i < mols.length; i++) {
    const molecule = OCLMolecule.fromMolfile(mols[i].molfile);
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
