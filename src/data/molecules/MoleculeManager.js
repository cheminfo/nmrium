import { Molecule as OCLMolecule } from 'openchemlib/full';

import { Molecule } from './Molecule';

export function fromJSON(mols = []) {
  const molecules = [];
  for (let i = 0; i < mols.length; i++) {
    const molecule = OCLMolecule.fromMolfile(mols[i].molfile);
    const fragments = molecule.getFragments();
    for (let fragment of fragments) {
      molecules.push(
        new Molecule({
          molfile: fragment.toMolfileV3(),
        }),
      );
    }
  }

  return molecules;
}
