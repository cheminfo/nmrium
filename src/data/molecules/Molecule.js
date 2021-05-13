import { Molecule as OCLMolecule } from 'openchemlib/full';

import generateID from '../utilities/generateID';
import getAtomsFromMF from '../utilities/getAtomsFromMF';

/**
 * @param {object} [options={}]
 * @param {object} [options.molfile='']
 * @param {object} [options.key=Math.random()] Optional unique identifier
 */
export function initMolecule(options = {}) {
  const molecule = {};
  molecule.key = options.key || generateID();
  molecule.molfile = options.molfile || '';
  const mol = new OCLMolecule.fromMolfile(molecule.molfile);
  const mfInfo = mol.getMolecularFormula();
  molecule.mf = mfInfo.formula;
  molecule.em = mfInfo.absoluteWeight;
  molecule.mw = mfInfo.relativeWeight;
  molecule.svg = mol.toSVG(50, 50);

  molecule.atoms = getAtomsFromMF(molecule.mf);
  return molecule;
}

export function toJSON(molecule) {
  return {
    molfile: molecule.molfile,
  };
}
