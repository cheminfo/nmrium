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

  if (/v[23]000/i.test(text)) {
    return Molecule.fromMolfile(text);
  }

  try {
    return Molecule.fromSmiles(moleculeText);
  } catch {
    // fallback to expanding chemical groups if SMILES parsing fails
    // for example HAlaGlyOH, BocAlaOH ...etc.
    // TODO a way to check if the text is a valid chemical group instead of fallback if can not read as SMILES
    return expandChemicalGroups(moleculeText);
  }
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
