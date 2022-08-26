import { Draft } from 'immer';

import { generateSpectra } from '../../../data/PredictionManager';
import { changeSpectraRelativeSum } from '../../../data/data1d/Spectrum1D/SumManager';
import * as MoleculeManager from '../../../data/molecules/MoleculeManager';
import getColor from '../../../data/utilities/getColor';
import { DRAGGABLE_STRUCTURE_INITIAL_POSITION } from '../../tool/FloatMoleculeStructures/DraggableStructure';
import nucleusToString from '../../utility/nucleusToString';
import { State } from '../Reducer';
import { DISPLAYER_MODE } from '../core/Constants';

import { handleUnlinkRange } from './RangesActions';
import { setActiveTab } from './ToolsActions';
import { handleUnlinkZone } from './ZonesActions';

function addMoleculeHandler(draft: Draft<State>, molfile) {
  const isEmpty = draft.molecules.length === 0;
  MoleculeManager.addMolfile(draft.molecules, molfile);

  /**
   *  if it's the first creation of a molecule after the molecules list was empty,
   * set the relative sum for ranges and integrals base on the first molecule
   */
  const molecule = draft.molecules[0] || null;

  if (isEmpty && molecule) {
    changeSpectraRelativeSum(draft, molecule.id, molecule);
  }
}

function setMoleculeHandler(draft: Draft<State>, action) {
  const { id, label, molfile } = action.payload;
  MoleculeManager.setMolfile(draft.molecules, {
    id,
    label,
    molfile,
  });

  /**
   * update all spectra that its sum was based on this molecule with the new molecule
   */
  const index = draft.molecules.findIndex((molecule) => molecule.id === id);

  changeSpectraRelativeSum(
    draft,
    id,
    index !== -1 ? draft.molecules[index] : draft.molecules[0] || null,
  );
}

function removeAssignments(draft: Draft<State>, assignmentData: any) {
  if (draft.displayerMode === DISPLAYER_MODE.DM_1D) {
    handleUnlinkRange(draft, { payload: { assignmentData, rangeData: null } });
  }
  if (draft.displayerMode === DISPLAYER_MODE.DM_2D) {
    handleUnlinkZone(draft, { payload: { assignmentData, zoneData: null } });
  }
}

function deleteMoleculeHandler(draft: Draft<State>, action) {
  const { id, assignmentData } = action.payload;
  // remove Assignments links of the active spectrum
  removeAssignments(draft, assignmentData);

  const moleculeIndex = draft.molecules.findIndex(
    (molecule) => molecule.id === id,
  );
  draft.molecules.splice(moleculeIndex, 1);
  const floatingMoleculesIndex = draft.view.floatingMolecules.findIndex(
    (m) => m.id === id,
  );
  if (floatingMoleculesIndex !== -1) {
    draft.view.floatingMolecules.splice(floatingMoleculesIndex, 1);
  }
  /**
   * update all spectra that its sum was based on this molecule with the first molecule
   * from molecules list and if no remains molecules it sum will be 100
   */
  changeSpectraRelativeSum(draft, id, draft.molecules[0] || null);
}

function predictSpectraFromMoleculeHandler(draft: Draft<State>, action) {
  const { data, options } = action.payload;
  if (!data) {
    draft.isLoading = false;
  } else {
    const color = getColor(false, draft.usedColors['1d']);
    for (const spectrum of generateSpectra(data, options, color)) {
      draft.data.push(spectrum);
      draft.tabActiveSpectrum[nucleusToString(spectrum.info.nucleus)] = {
        id: spectrum.id,
        index: draft.data.length - 1,
      };
    }
    draft.usedColors['1d'].push(color);
  }
  draft.toolOptions.data.predictionIndex++;
  setActiveTab(draft);
  draft.isLoading = false;
}
function floatMoleculeOverSpectrum(draft: Draft<State>, action) {
  const { id } = action.payload;
  const moleculeIndex = draft.view.floatingMolecules.findIndex(
    (m) => m.id === id,
  );
  if (moleculeIndex !== -1) {
    draft.view.floatingMolecules[moleculeIndex].visible =
      !draft.view.floatingMolecules[moleculeIndex].visible;
  } else {
    draft.view.floatingMolecules.push({
      id,
      visible: true,
      position: DRAGGABLE_STRUCTURE_INITIAL_POSITION,
    });
  }
}
function changeFloatMoleculePosition(draft: Draft<State>, action) {
  const { id, position } = action.payload;
  const moleculeIndex = draft.view.floatingMolecules.findIndex(
    (m) => m.id === id,
  );
  if (moleculeIndex !== -1) {
    draft.view.floatingMolecules[moleculeIndex].position = position;
  } else {
    throw new Error(`Molecule ${id} does not exist`);
  }
}
function changeMoleculeLabel(draft: Draft<State>, action) {
  const { id, label } = action.payload;
  const moleculeIndex = draft.molecules.findIndex(
    (molecule) => molecule.id === id,
  );
  draft.molecules[moleculeIndex].label = label;
}

export {
  addMoleculeHandler,
  setMoleculeHandler,
  deleteMoleculeHandler,
  predictSpectraFromMoleculeHandler,
  floatMoleculeOverSpectrum,
  changeFloatMoleculePosition,
  changeMoleculeLabel,
};
