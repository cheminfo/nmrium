import { Molecule } from 'openchemlib';
import { Molecule as mol } from './Molecule';

export class MoleculeManager {
  static fromJSON =  function fromJSON(mols = []) {

    console.log(mols);

    let molecules = [];
    for (let i = 0; i < mols.length; i++) {
      let molecule = Molecule.fromMolfile(mols[i].molfile);
      console.log(molecule);
      let fragments = molecule.getFragments();
      console.log(fragments);

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
     
    console.log(molecules);
    return molecules;

  };
}
