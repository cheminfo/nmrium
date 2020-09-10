import { Molecule as OCLMolecule } from 'openchemlib/full';

import { Molecule } from './Molecule';

export class MoleculeManager {
  static fromJSON = function fromJSON(mols = []) {
    let molecules = [];
    for (let i = 0; i < mols.length; i++) {
      let molecule = OCLMolecule.fromMolfile(mols[i].molfile);
      let fragments = molecule.getFragments();
      for (let fragment of fragments) {
        molecules.push(
          new Molecule({
            molfile: fragment.toMolfileV3(),
          }),
        );
      }
    }

    return molecules;
  };
}
