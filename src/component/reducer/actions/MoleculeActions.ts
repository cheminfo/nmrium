import { Draft } from 'immer';

import { generateSpectra } from '../../../data/PredictionManager';
import { changeSpectraRelativeSum } from '../../../data/data1d/Spectrum1D/SumManager';
import * as MoleculeManager from '../../../data/molecules/MoleculeManager';
import getColor from '../../../data/utilities/getColor';
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
    changeSpectraRelativeSum(draft, molecule.key, molecule);
  }
}

function setMoleculeHandler(draft: Draft<State>, molfile, key) {
  MoleculeManager.setMolfile(draft.molecules, molfile, key);

  /**
   * update all spectra that its sum was based on this molecule with the new molecule
   */
  const index = draft.molecules.findIndex((molecule) => molecule.key === key);

  changeSpectraRelativeSum(
    draft,
    key,
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
  const { key, assignmentData } = action.payload;
  // remove Assignments links of the active spectrum
  removeAssignments(draft, assignmentData);

  const moleculeIndex = draft.molecules.findIndex(
    (molecule) => molecule.key === key,
  );
  draft.molecules.splice(moleculeIndex, 1);
  /**
   * update all spectra that its sum was based on this molecule with the first molecule
   * from molecules list and if no remains molecules it sum will be 100
   */
  changeSpectraRelativeSum(draft, key, draft.molecules[0] || null);
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

export {
  addMoleculeHandler,
  setMoleculeHandler,
  deleteMoleculeHandler,
  predictSpectraFromMoleculeHandler,
};
