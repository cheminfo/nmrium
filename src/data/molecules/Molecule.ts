import type { MoleculeView, StateMolecule } from '@zakodium/nmrium-core';
import { Molecule } from 'openchemlib';

import getAtomsFromMF from '../utilities/getAtomsFromMF.js';

export interface StateMoleculeExtended
  extends
    Required<Pick<StateMolecule, 'id' | 'molfile' | 'label'>>,
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

type MoleculeInput = { molecule: Molecule } | { molfile: string };
type StateMoleculeOptions = Omit<Partial<StateMolecule>, 'molfile'>;
type InitializeMoleculeOptions = MoleculeInput & StateMoleculeOptions;

function resolveMolecule(options: MoleculeInput) {
  if ('molecule' in options) {
    const { molecule } = options;
    return {
      molecule,
      molfile: molecule.toMolfileV3(),
    };
  }
  const { molfile } = options;
  return {
    molecule: Molecule.fromMolfile(molfile),
    molfile,
  };
}

export function initMolecule(
  options: { molecule: Molecule } & StateMoleculeOptions,
): StateMoleculeExtended;
export function initMolecule(
  options: { molfile: string } & StateMoleculeOptions,
): StateMoleculeExtended;
export function initMolecule(
  options: InitializeMoleculeOptions,
): StateMoleculeExtended {
  const { id = crypto.randomUUID(), label = 'p#' } = options;

  const { molecule, molfile } = resolveMolecule(options);
  const mfInfo = molecule.getMolecularFormula();

  return {
    id,
    molfile,
    label,
    selector: options.selector,
    mf: mfInfo.formula,
    em: mfInfo.absoluteWeight,
    mw: mfInfo.relativeWeight,
    svg: molecule.toSVG(50, 50),
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
