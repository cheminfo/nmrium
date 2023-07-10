import { FifoLogger } from 'fifo-logger';
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
import { State } from '../Reducer';
import { DISPLAYER_MODE, MARGIN } from '../core/Constants';
import { ActionType } from '../types/ActionType';

import { unlinkRange } from './RangesActions';
import { setActiveTab } from './ToolsActions';
import { unlinkZone } from './ZonesActions';

interface AddMoleculeProps {
  molfile: string;
  floatMoleculeOnSave?: boolean;
}
type AddMoleculeAction = ActionType<'ADD_MOLECULE', AddMoleculeProps>;
type SetMoleculeAction = ActionType<'SET_MOLECULE', Required<StateMolecule>>;
type DeleteMoleculeAction = ActionType<
  'DELETE_MOLECULE',
  { id: string; assignmentData: AssignmentContext }
>;
type PredictSpectraFromMoleculeAction = ActionType<
  'PREDICT_SPECTRA',
  {
    logger?: FifoLogger;
    options: PredictionOptions;
    predictedSpectra: PredictedSpectraResult;
    molecule: StateMolecule;
    action?: 'save' | 'add';
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

function addMolecule(draft: Draft<State>, props: AddMoleculeProps) {
  const { molfile, floatMoleculeOnSave } = props;
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

  const lastAddedMolecule = draft.molecules.at(-1);
  if (floatMoleculeOnSave && lastAddedMolecule) {
    floatMoleculeOverSpectrum(draft, lastAddedMolecule.id, true);
  }

  return lastAddedMolecule;
}

//action
function handleAddMolecule(draft: Draft<State>, action: AddMoleculeAction) {
  addMolecule(draft, action.payload);
}

function setMolecule(draft: Draft<State>, props: Required<StateMolecule>) {
  const { id, label, molfile } = props;
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
//action
function handleSetMolecule(draft: Draft<State>, action: SetMoleculeAction) {
  setMolecule(draft, action.payload);
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
  const {
    logger,
    predictedSpectra,
    options,
    molecule,
    action: predictionAction = 'save',
  } = action.payload;
  const color = generateColor(false, draft.usedColors['1d']);
  const spectraIds: string[] = [];
  for (const spectrum of generateSpectra(
    predictedSpectra,
    options,
    color,
    logger,
  )) {
    draft.data.push(spectrum);
    spectraIds.push(spectrum.id);
  }
  let id = molecule?.id;
  //if the id object is not exits add a new molecule
  if (!id || predictionAction === 'add') {
    const moleculeObj = addMolecule(draft, {
      molfile: molecule.molfile,
      floatMoleculeOnSave: true,
    });
    id = moleculeObj?.id;
  } else {
    setMolecule(draft, molecule as Required<StateMolecule>);
  }

  if (id) {
    //save a set of the predicted spectra Ids by molecule ID in the view object in case we predict the spectra again we remove the old ones
    setPredictedSpectraReference(draft, id, spectraIds);
  }
  draft.usedColors['1d'] = draft.usedColors['1d'].filter(
    (previousColor) => previousColor !== color,
  );
  draft.usedColors['1d'].push(color);

  draft.toolOptions.data.predictionIndex++;
  setActiveTab(draft, { refreshActiveTab: true, tab: '1H' });
}

function setPredictedSpectraReference(
  draft: Draft<State>,
  moleculeId: string,
  spectraIds: string[],
) {
  const predictedSpectraIds = draft.view.predictions?.[moleculeId];
  // check if the molecule predicted and return and the spectra Ids
  if (predictedSpectraIds) {
    //remove the old predicted spectra for the current molecule
    draft.data = draft.data.filter(
      (spectrum) => !predictedSpectraIds.includes(spectrum.id),
    );
  }
  // set the predicted spectra ids
  draft.view.predictions[moleculeId] = spectraIds;
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

function floatMoleculeOverSpectrum(
  draft: Draft<State>,
  moleculeId: string,
  value?: boolean,
) {
  initMoleculeViewProperties(moleculeId, draft);
  const molecule = getMoleculeViewObject(moleculeId, draft);
  if (molecule) {
    molecule.floating.visible = value ?? !molecule.floating.visible;
  }
}

//action
function handleFloatMoleculeOverSpectrum(
  draft: Draft<State>,
  action: ToggleMoleculeViewObjectAction,
) {
  const { id } = action.payload;

  floatMoleculeOverSpectrum(draft, id);
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
