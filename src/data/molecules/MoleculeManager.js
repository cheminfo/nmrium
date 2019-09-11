import { Molecule } from 'openchemlib';

import { Molecule as mol } from './Molecule';

export class MoleculeManager {
  static fromJSON = function fromJSON(mols = []) {
    let molecules = [];
    for (let i = 0; i < mols.length; i++) {
      let molecule = Molecule.fromMolfile(mols[i].molfile);
      let fragments = molecule.getFragments();

      for (let fragment of fragments) {
        molecules.push(
          new mol({
            molfile: fragment.toMolfileV3(),
            svg: fragment.toSVG(50, 50),
            mf: fragment.getMolecularFormula().formula,
            em: fragment.getMolecularFormula().absoluteWeight,
            mw: fragment.getMolecularFormula().relativeWeight,
          }),
        );
      }
    }

    return molecules;
  };
}
