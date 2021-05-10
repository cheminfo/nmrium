import { Molecule, Molecule as OCLMolecule } from 'openchemlib/full';

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

export function addMolfile(molecules, molfile) {
  // try to parse molfile
  // this will throw if the molecule can not be parsed !
  const molecule = Molecule.fromMolfile(molfile);
  let fragments = molecule.getFragments();
  for (let fragment of fragments) {
    const { formula, absoluteWeight, relativeWeight } =
      fragment.getMolecularFormula();
    molecules.push(
      initMolecule({
        molfile: fragment.toMolfileV3(),
        svg: fragment.toSVG(150, 150),
        mf: formula,
        em: absoluteWeight,
        mw: relativeWeight,
      }),
    );
  }
  // we will split if we have many fragments
}

export function setMolfile(molecules, molfile, key) {
  // try to parse molfile
  // this will throw if the molecule can not be parsed !
  let molecule = Molecule.fromMolfile(molfile);
  let fragments = molecule.getFragments();

  if (fragments.length > 1) {
    molecules = this.molecules.filter((m) => m.key !== key);

    for (let fragment of fragments) {
      const { formula, absoluteWeight, relativeWeight } =
        fragment.getMolecularFormula();

      molecules.push(
        new initMolecule({
          molfile: fragment.toMolfileV3(),
          svg: fragment.toSVG(150, 150),
          mf: formula,
          em: absoluteWeight,
          mw: relativeWeight,
        }),
      );
    }
  } else if (fragments.length === 1) {
    const fragment = fragments[0];
    const { formula, absoluteWeight, relativeWeight } =
      fragment.getMolecularFormula();
    const _mol = initMolecule({
      molfile: fragment.toMolfileV3(),
      svg: fragment.toSVG(150, 150),
      mf: formula,
      em: absoluteWeight,
      mw: relativeWeight,
      key: key,
    });
    let molIndex = molecules.findIndex((m) => m.key === key);
    molecules.splice(molIndex, 1, _mol);
  }

  // we will split if we have many fragments
}
