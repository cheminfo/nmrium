import { Molecule as OCLMolecule } from 'openchemlib/full';

import generateID from '../utilities/generateID';
import getAtomsFromMF from '../utilities/getAtomsFromMF';

export interface MoleculeObject {
  id: string;
  molfile: string;
  isFloat: boolean;
  label: string;
}
export interface Molecule extends MoleculeObject {
  mf: string;
  em: number;
  mw: number;
  svg: string;
  atoms: Record<string, number>;
}

export function initMolecule(options: Partial<MoleculeObject> = {}): Molecule {
  const id = options.id || generateID();
  const label = options.label || 'p#';
  const molfile = options.molfile || '';
  const isFloat =
    typeof options?.isFloat === 'boolean' ? options.isFloat : false;

  const mol = OCLMolecule.fromMolfile(molfile);
  const mfInfo = mol.getMolecularFormula();

  return {
    id,
    molfile,
    label,
    mf: mfInfo.formula,
    em: mfInfo.absoluteWeight,
    mw: mfInfo.relativeWeight,
    svg: mol.toSVG(50, 50),
    atoms: getAtomsFromMF(mfInfo.formula),
    isFloat,
  };
}

export function toJSON(molecule: Molecule): MoleculeObject {
  const { molfile, label, isFloat, id } = molecule;
  return {
    molfile,
    label,
    isFloat,
    id,
  };
}
