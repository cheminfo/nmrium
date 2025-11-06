import type { StateMolecule } from '@zakodium/nmrium-core';
import { Molecule } from 'openchemlib';

import getAtomsFromMF from '../utilities/getAtomsFromMF.js';

export interface StateMoleculeExtended
  extends Required<Pick<StateMolecule, 'id' | 'molfile' | 'label'>>,
    Omit<StateMolecule, 'id' | 'molfile' | 'label'> {
  mf: string;
  em: number;
  mw: number;
  svg: string;
  atoms: Record<string, number>;
}

export interface MoleculeBoundingRect {
  width: number;
  height: number;
  x: number;
  y: number;
}

export const DRAGGABLE_STRUCTURE_INITIAL_BOUNDING_REACT: MoleculeBoundingRect =
  {
    x: 10,
    y: 10,
    width: 130,
    height: 120,
  };

export type MoleculesView = Record<string, MoleculeView>;
export interface MoleculeView {
  floating: {
    /**
     * If the floating molecule is shown.
     */
    visible: boolean;
    /**
     * Floating molecule position.
     */
    bounding: MoleculeBoundingRect;
  };
  /**
   * Show/Hide atoms numbers on the molecule.
   */
  showAtomNumber: boolean;
}
export function initMolecule(
  options: Partial<StateMolecule> = {},
): StateMoleculeExtended {
  const id = options.id || crypto.randomUUID();
  const label = options.label || 'p#';
  const molfile = options.molfile || '';

  const mol = Molecule.fromMolfile(molfile);
  const mfInfo = mol.getMolecularFormula();

  return {
    id,
    molfile,
    label,
    selector: options.selector,
    mf: mfInfo.formula,
    em: mfInfo.absoluteWeight,
    mw: mfInfo.relativeWeight,
    svg: mol.toSVG(50, 50),
    atoms: getAtomsFromMF(mfInfo.formula),
  };
}

export function toJSON(molecule: StateMoleculeExtended): StateMolecule {
  const { molfile, label, id, selector } = molecule;

  return {
    molfile,
    label,
    id,
    selector,
  };
}
