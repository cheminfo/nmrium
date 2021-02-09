import { Molecule } from 'openchemlib/full';

import { initMolecule } from '../../../data/molecules/Molecule';

function handleAddMolecule(draft, molfile) {
  const molecule = Molecule.fromMolfile(molfile);
  const fragments = molecule.getFragments();
  for (let fragment of fragments) {
    draft.molecules.push(
      initMolecule({
        molfile: fragment.toMolfileV3(),
        svg: fragment.toSVG(150, 150),
        mf: fragment.getMolecularFormula().formula,
        em: fragment.getMolecularFormula().absoluteWeight,
        mw: fragment.getMolecularFormula().relativeWeight,
      }),
    );
  }
}

function handleSetMolecule(draft, molfile, key) {
  const molecule = Molecule.fromMolfile(molfile);
  const fragments = molecule.getFragments();

  if (fragments.length > 1) {
    draft.molecules = draft.molecules.filter((m) => m.key !== key);

    for (const fragment of fragments) {
      const {
        formula,
        absoluteWeight,
        relativeWeight,
      } = fragment.getMolecularFormula();

      draft.molecules.push(
        initMolecule({
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
    const {
      formula,
      absoluteWeight,
      relativeWeight,
    } = fragment.getMolecularFormula();

    const _mol = initMolecule({
      molfile: fragment.toMolfileV3(),
      svg: fragment.toSVG(150, 150),
      mf: formula,
      em: absoluteWeight,
      mw: relativeWeight,
      key: key,
    });
    const molIndex = draft.molecules.findIndex((m) => m.key === key);
    draft.molecules.splice(molIndex, 1, _mol);
  }
}

function handleDeleteMolecule(draft, key) {
  const moleculeIndex = draft.molecules.findIndex(
    (molecule) => molecule.key === key,
  );

  draft.molecules.splice(moleculeIndex, 1);
}

export { handleAddMolecule, handleSetMolecule, handleDeleteMolecule };
