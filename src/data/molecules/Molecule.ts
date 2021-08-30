import { Molecule as OCLMolecule } from 'openchemlib/full';

import generateID from '../utilities/generateID';
import getAtomsFromMF from '../utilities/getAtomsFromMF';

interface MoleculeInnerProps {
  key: string;
  molfile: string;
}
export interface Molecule extends MoleculeInnerProps {
  mf: string;
  em: number;
  mw: number;
  svg: string;
  atoms: Record<string, number>;
}

export function initMolecule(
  options: Partial<MoleculeInnerProps> = {},
): Molecule {
  const key = options.key || generateID();
  const molfile = options.molfile || '';

  const mol = OCLMolecule.fromMolfile(molfile);
  const mfInfo = mol.getMolecularFormula();

  return {
    key,
    molfile,
    mf: mfInfo.formula,
    em: mfInfo.absoluteWeight,
    mw: mfInfo.relativeWeight,
    svg: mol.toSVG(50, 50),
    atoms: getAtomsFromMF(mfInfo.formula),
  };
}

export function toJSON(molecule: Molecule): { molfile: string } {
  return {
    molfile: molecule.molfile,
  };
}
