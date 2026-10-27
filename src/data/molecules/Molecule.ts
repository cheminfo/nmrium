import type { MoleculeView, StateMolecule } from '@zakodium/nmrium-core';
import { expandChemicalGroups } from 'expand-chemical-groups';
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

type InitializeMoleculeOptions = { text: string } & Omit<
  Partial<StateMolecule>,
  'molfile'
>;

export const parseErrorMessage =
  'Failed to parse SMILES, molfile or chemical groups. Please paste a valid format';

function parseMoleculeText(text: string): Molecule {
  const moleculeText = text.trim();
  if (!moleculeText) {
    throw new Error(parseErrorMessage);
  }

  const molecule = Molecule.fromText(text);
  if (molecule && molecule.getAllAtoms() > 0) {
    return molecule;
  }
  // fallback to expanding chemical groups if `fromText` parsing fails
  // for example HAlaGlyOH, BocAlaOH ...etc.
  return expandChemicalGroups(moleculeText);
}

export function initMolecule(
  options: InitializeMoleculeOptions,
): StateMoleculeExtended {
  const { id = crypto.randomUUID(), label = 'p#', text, selector } = options;
  const molecule = parseMoleculeText(text);

  if (molecule.getAllAtoms() === 0) {
    throw new Error(parseErrorMessage);
  }
  const molfile = molecule.toMolfileV3();
  const mfInfo = molecule.getMolecularFormula();

  return {
    id,
    molfile,
    label,
    selector,
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
