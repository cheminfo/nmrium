import { Draft } from 'immer';

import {
  PredictedSpectraResult,
  PredictionOptions,
  generateSpectra,
} from '../../../data/PredictionManager';
import { changeSpectraRelativeSum } from '../../../data/data1d/Spectrum1D/SumManager';
import {
  DRAGGABLE_STRUCTURE_INITIAL_BOUNDING_REACT,
  MoleculeBoundingRect,
  StateMolecule,
} from '../../../data/molecules/Molecule';
import * as MoleculeManager from '../../../data/molecules/MoleculeManager';
import { generateColor } from '../../../data/utilities/generateColor';
import { AssignmentContext } from '../../assignment/AssignmentsContext';
import nucleusToString from '../../utility/nucleusToString';
import { State } from '../Reducer';
import { DISPLAYER_MODE, MARGIN } from '../core/Constants';
import { ActionType } from '../types/ActionType';

import { unlinkRange } from './RangesActions';
import { setActiveTab } from './ToolsActions';
import { unlinkZone } from './ZonesActions';

type AddMoleculeAction = ActionType<'ADD_MOLECULE', { molfile: string }>;
type SetMoleculeAction = ActionType<'SET_MOLECULE', Required<StateMolecule>>;
type DeleteMoleculeAction = ActionType<
  'DELETE_MOLECULE',
  { id: string; assignmentData: AssignmentContext }
>;
type PredictSpectraFromMoleculeAction = ActionType<
  'PREDICT_SPECTRA',
  {
    molfile: string;
    options: PredictionOptions;
    predictedSpectra?: PredictedSpectraResult;
  }
>;
type ToggleMoleculeViewObjectAction = ActionType<
  'FLOAT_MOLECULE_OVER_SPECTRUM' | 'TOGGLE_MOLECULE_ATOM_NUMBER',
  { id: string }
>;
type ChangeFloatMoleculePositionAction = ActionType<
  'CHANGE_FLOAT_MOLECULE_POSITION',
  { id: string; bounding: MoleculeBoundingRect }
>;
type ChangeMoleculeLabelAction = ActionType<
  'CHANGE_MOLECULE_LABEL',
  { id: string; label: string }
>;

export type MoleculeActions =
  | AddMoleculeAction
  | SetMoleculeAction
  | DeleteMoleculeAction
  | PredictSpectraFromMoleculeAction
  | ToggleMoleculeViewObjectAction
  | ChangeFloatMoleculePositionAction
  | ChangeMoleculeLabelAction;

//action
function handleAddMolecule(draft: Draft<State>, action: AddMoleculeAction) {
  const { molfile } = action.payload;
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

//action
function handleSetMolecule(draft: Draft<State>, action: SetMoleculeAction) {
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

function removeAssignments(
  draft: Draft<State>,
  assignmentData: AssignmentContext,
) {
  if (draft.displayerMode === DISPLAYER_MODE.DM_1D) {
    unlinkRange(draft, { assignmentData });
  }
  if (draft.displayerMode === DISPLAYER_MODE.DM_2D) {
    unlinkZone(draft, { assignmentData });
  }
}

//action
function handleDeleteMolecule(
  draft: Draft<State>,
  action: DeleteMoleculeAction,
) {
  const { id, assignmentData } = action.payload;
  // remove Assignments links of the active spectrum
  removeAssignments(draft, assignmentData);

  const moleculeIndex = draft.molecules.findIndex(
    (molecule) => molecule.id === id,
  );
  draft.molecules.splice(moleculeIndex, 1);

  // delete the molecule view object for this id
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete draft.view.molecules[id];

  /**
   * update all spectra that its sum was based on this molecule with the first molecule
   * from molecules list and if no remains molecules it sum will be 100
   */
  changeSpectraRelativeSum(draft, id, draft.molecules[0] || null);
}

//action
function handlePredictSpectraFromMolecule(
  draft: Draft<State>,
  action: PredictSpectraFromMoleculeAction,
) {
  const { predictedSpectra, options } = action.payload;
  if (!predictedSpectra) {
    draft.isLoading = false;
  } else {
    const color = generateColor(false, draft.usedColors['1d']);
    for (const spectrum of generateSpectra(predictedSpectra, options, color)) {
      draft.data.push(spectrum);
      draft.view.spectra.activeSpectra[nucleusToString(spectrum.info.nucleus)] =
        [
          {
            id: spectrum.id,
            index: draft.data.length - 1,
          },
        ];
    }
    draft.usedColors['1d'].push(color);
  }
  draft.toolOptions.data.predictionIndex++;
  setActiveTab(draft);
  draft.isLoading = false;
}

function initMoleculeViewProperties(id: string, draft: Draft<State>) {
  // check if the molecule is exists in the view object otherwise add it with the default value
  if (!draft.view.molecules[id]) {
    const position = getFloatingMoleculeInitialPosition(id, draft);
    draft.view.molecules[id] = {
      floating: {
        visible: false,
        bounding: {
          ...DRAGGABLE_STRUCTURE_INITIAL_BOUNDING_REACT,
          ...position,
        },
      },
      showAtomNumber: false,
    };
  }
}

function getMoleculeViewObject(id: string, draft: Draft<State>) {
  return draft.view.molecules[id] || null;
}

function getFloatingMoleculeInitialPosition(id: string, draft: Draft<State>) {
  const {
    view: { molecules },
    width: displayerWidth,
    height: displayerHeight,
  } = draft;
  const { top, left } = MARGIN['2D'];
  const { width: baseWidth, height: baseHeight } =
    DRAGGABLE_STRUCTURE_INITIAL_BOUNDING_REACT;
  const width = displayerWidth - left;
  const height = displayerHeight - top;
  const columns = Math.floor(width / baseWidth);
  const rows = Math.floor(height / baseHeight);
  const moleculeKeys = Object.keys(molecules);

  let index = 0;

  if (!molecules[id]) {
    index = moleculeKeys.length - 1;
  } else {
    index = moleculeKeys.indexOf(id);
  }
  const x = ((index + 1) % columns) * (width / columns) + left;
  const y = Math.floor(moleculeKeys.length / columns) * (height / rows) + top;
  return { x, y };
}

//action
function handleFloatMoleculeOverSpectrum(
  draft: Draft<State>,
  action: ToggleMoleculeViewObjectAction,
) {
  const { id } = action.payload;

  initMoleculeViewProperties(id, draft);
  const molecule = getMoleculeViewObject(id, draft);
  if (molecule) {
    molecule.floating.visible = !molecule.floating.visible;
  }
}

//action
function handleToggleMoleculeAtomsNumbers(
  draft: Draft<State>,
  action: ToggleMoleculeViewObjectAction,
) {
  const { id } = action.payload;

  initMoleculeViewProperties(id, draft);
  const molecule = getMoleculeViewObject(id, draft);
  if (molecule) {
    molecule.showAtomNumber = !molecule.showAtomNumber;
  }
}

//action
function handleChangeFloatMoleculePosition(
  draft: Draft<State>,
  action: ChangeFloatMoleculePositionAction,
) {
  const { id, bounding } = action.payload;
  const molecule = getMoleculeViewObject(id, draft);
  if (molecule) {
    molecule.floating.bounding = { ...molecule.floating.bounding, ...bounding };
  } else {
    throw new Error(`Molecule ${id} does not exist`);
  }
}

//action
function handleChangeMoleculeLabel(
  draft: Draft<State>,
  action: ChangeMoleculeLabelAction,
) {
  const { id, label } = action.payload;
  const moleculeIndex = draft.molecules.findIndex(
    (molecule) => molecule.id === id,
  );
  draft.molecules[moleculeIndex].label = label;
}

export {
  handleAddMolecule,
  handleSetMolecule,
  handleDeleteMolecule,
  handlePredictSpectraFromMolecule,
  handleFloatMoleculeOverSpectrum,
  handleToggleMoleculeAtomsNumbers,
  handleChangeFloatMoleculePosition,
  handleChangeMoleculeLabel,
};
