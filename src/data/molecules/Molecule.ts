import { v4 } from '@lukeed/uuid';
import { Molecule as OCLMolecule } from 'openchemlib/full';

import getAtomsFromMF from '../utilities/getAtomsFromMF';

export interface MoleculeObject {
  id: string;
  molfile: string;
  label: string;
}
export interface Molecule extends MoleculeObject {
  mf: string;
  em: number;
  mw: number;
  svg: string;
  atoms: Record<string, number>;
}
export interface FloatingMolecules {
  /**
   * Reference to the id in molecules.
   */
  id: string;
  /**
   * If the floating molecule is shown.
   */
  visible: boolean;
}
export function initMolecule(options: Partial<MoleculeObject> = {}): Molecule {
  const id = options.id || v4();
  const label = options.label || 'p#';
  const molfile = options.molfile || '';

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
  };
}

export function toJSON(molecule: Molecule): MoleculeObject {
  const { molfile, label, id } = molecule;
  return {
    molfile,
    label,
    id,
  };
}
