import type { MoleculeView, StateMolecule } from '@zakodium/nmrium-core';
import type { Logger } from 'cheminfo-types';
import type { FifoLogger } from 'fifo-logger';
import type { Draft } from 'immer';
import { Molecule } from 'openchemlib';
import type { DiaIDAndInfo, TopicMolecule } from 'openchemlib-utils';
import { getAtoms, nbLabileH } from 'openchemlib-utils';

import type {
  Experiment,
  PredictedSpectraResult,
  PredictionOptions,
} from '../../../data/PredictionManager.js';
import { generateSpectra } from '../../../data/PredictionManager.js';
import { changeSpectraRelativeSum } from '../../../data/data1d/Spectrum1D/SumManager.js';
import { isSpectrum1D } from '../../../data/data1d/Spectrum1D/isSpectrum1D.ts';
import type { MoleculeBoundingRect } from '../../../data/molecules/Molecule.js';
import { DRAGGABLE_STRUCTURE_INITIAL_BOUNDING_REACT } from '../../../data/molecules/Molecule.js';
import * as MoleculeManager from '../../../data/molecules/MoleculeManager.js';
import { generateColor } from '../../../data/utilities/generateColor.js';
import { convertPixelToPercent } from '../../hooks/useSVGUnitConverter.js';
import { extractFromAtom } from '../../panels/MoleculesPanel/utilities/extractFromAtom.ts';
import nucleusToString from '../../utility/nucleusToString.ts';
import type { State } from '../Reducer.js';
import { MARGIN } from '../core/Constants.js';
import type { ActionType } from '../types/ActionType.js';

import { setActiveTab } from './ToolsActions.js';
import { deepReplaceDiaIDs } from './utilities/deepReplaceDiaIDs.js';

interface AddMoleculeProps {
  molfile: string;
  id?: string;
  floatMoleculeOnSave?: boolean;
  defaultMoleculeSettings?: MoleculeView;
  label?: string;
}
type AddMoleculeAction = ActionType<'ADD_MOLECULE', AddMoleculeProps>;
type AddMoleculesAction = ActionType<
  'ADD_MOLECULES',
  {
    molecules: StateMolecule[];
    defaultMoleculeSettings?: MoleculeView;
  }
>;
type SetMoleculeAction = ActionType<
  'SET_MOLECULE',
  Required<Pick<StateMolecule, 'id' | 'molfile' | 'label'>> &
    Omit<StateMolecule, 'id' | 'molfile' | 'label'> & {
      mappings?: ReturnType<TopicMolecule['getDiaIDsMapping']>;
    }
>;
type DeleteMoleculeAction = ActionType<
  'DELETE_MOLECULE',
  { id: string; diaIDs?: DiaIDAndInfo[] }
>;
type PredictSpectraFromMoleculeAction = ActionType<
  'PREDICT_SPECTRA',
  {
    logger: FifoLogger;
    options: PredictionOptions;
    predictedSpectra: PredictedSpectraResult;
    molecule: StateMolecule;
    action?: 'save' | 'add';
  }
>;
type ToggleMoleculeViewObjectAction = ActionType<
  'FLOAT_MOLECULE_OVER_SPECTRUM',
  { id: string }
>;
type ToggleMoleculeLabelAction = ActionType<
  'TOGGLE_MOLECULE_LABEL',
  { id: string }
>;

interface ChangeMoleculeAnnotationOptions extends Pick<
  MoleculeView,
  'atomAnnotation'
> {
  id: string;
}

type ChangeMoleculeAnnotationAction = ActionType<
  'CHANGE_MOLECULE_ANNOTATION',
  ChangeMoleculeAnnotationOptions
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
  | AddMoleculesAction
  | SetMoleculeAction
  | DeleteMoleculeAction
  | PredictSpectraFromMoleculeAction
  | ToggleMoleculeViewObjectAction
  | ChangeFloatMoleculePositionAction
  | ChangeMoleculeLabelAction
  | ChangeMoleculeAnnotationAction
  | ToggleMoleculeLabelAction;

function addMolecule(draft: Draft<State>, props: AddMoleculeProps) {
  const { molfile, id, label, floatMoleculeOnSave, defaultMoleculeSettings } =
    props;
  const isEmpty = draft.molecules.length === 0;
  MoleculeManager.addMolfile(draft.molecules, molfile, { id, label });

  /**
   *  if it's the first creation of a molecule after the molecules list was empty,
   * set the relative sum for ranges and integrals base on the first molecule
   */
  const molecule = draft.molecules[0] || null;

  if (isEmpty && molecule) {
    changeSpectraRelativeSum(draft, molecule.id, molecule);
  }

  const lastAddedMolecule = draft.molecules.at(-1);
  if (lastAddedMolecule) {
    initMoleculeViewProperties(draft, {
      id: lastAddedMolecule.id,
      defaultMoleculeSettings,
      isMoleculeFloating: floatMoleculeOnSave,
    });
  }

  return lastAddedMolecule;
}

//action
function handleAddMolecule(draft: Draft<State>, action: AddMoleculeAction) {
  addMolecule(draft, action.payload);
}
function handleAddMolecules(draft: Draft<State>, action: AddMoleculesAction) {
  const { molecules, defaultMoleculeSettings } = action.payload;

  for (const { molfile } of molecules) {
    addMolecule(draft, { molfile, defaultMoleculeSettings });
  }
}

function setMolecule(draft: Draft<State>, props: SetMoleculeAction['payload']) {
  const { id, label, molfile, mappings } = props;
  MoleculeManager.setMolfile(draft.molecules, {
    id,
    label,
    molfile,
  });

  /**
   * update all spectra that its sum was based on this molecule with the new molecule
   */
  const index = draft.molecules.findIndex((molecule) => molecule.id === id);

  if (mappings) {
    deepReplaceDiaIDs(draft, mappings);
  }

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

function clearDiaIDs(
  obj: Partial<{ diaIDs?: string[]; nbAtoms?: number }>,
  options: {
    diaIDsObj: Record<string, DiaIDAndInfo>;
    nucleus: string[] | string;
  },
) {
  const { diaIDsObj, nucleus } = options;
  if (!obj.diaIDs?.some((id) => id in diaIDsObj)) {
    return;
  }

  const nucleusValue = nucleusToString(nucleus);
  let updatedDiaIDs = [...obj.diaIDs];
  let updatedNbAtoms = obj.nbAtoms || 0;

  for (const id of obj.diaIDs) {
    const atomInfo = diaIDsObj[id];
    if (!atomInfo) continue;

    const { nbAtoms: removedCount, oclIDs } = extractFromAtom(
      atomInfo,
      nucleusValue,
    );
    const removalSet = new Set(oclIDs);

    updatedDiaIDs = updatedDiaIDs.filter(
      (candidate) => !removalSet.has(candidate),
    );
    updatedNbAtoms -= removedCount;
  }

  if (updatedDiaIDs.length > 0) {
    obj.diaIDs = updatedDiaIDs;
  } else {
    delete obj.diaIDs;
  }

  if (updatedNbAtoms > 0) {
    obj.nbAtoms = updatedNbAtoms;
  } else {
    delete obj.nbAtoms;
  }
}

function clearAssignments(draft: Draft<State>, diaIDs: DiaIDAndInfo[]) {
  const diaIDsObj: Record<string, DiaIDAndInfo> = {};
  for (const diaItem of diaIDs) {
    diaIDsObj[diaItem.idCode] = diaItem;
  }

  for (const spectrum of draft.data) {
    const {
      info: { nucleus },
    } = spectrum;

    if (isSpectrum1D(spectrum)) {
      const ranges = spectrum.ranges.values;
      for (const range of ranges) {
        const { signals = [] } = range;
        for (const signal of signals) {
          clearDiaIDs(signal, { diaIDsObj, nucleus });
        }
      }
    } else {
      const zones = spectrum.zones.values;
      for (const zone of zones) {
        const { signals = [] } = zone;
        clearDiaIDs(zone.x, { diaIDsObj, nucleus });
        clearDiaIDs(zone.y, { diaIDsObj, nucleus });

        for (const signal of signals) {
          clearDiaIDs(signal.x, { diaIDsObj, nucleus });
          clearDiaIDs(signal.y, { diaIDsObj, nucleus });
        }
      }
    }
  }
}

//action
function handleDeleteMolecule(
  draft: Draft<State>,
  action: DeleteMoleculeAction,
) {
  const { id, diaIDs } = action.payload;

  const moleculeIndex = draft.molecules.findIndex(
    (molecule) => molecule.id === id,
  );

  if (diaIDs) {
    clearAssignments(draft, diaIDs);
  }

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
  checkPredictions(predictedSpectra, options, molecule.molfile, logger);
  const color = generateColor({ usedColors: draft.usedColors['1d'] });
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
    setMolecule(draft, { id: crypto.randomUUID(), label: '', ...molecule });
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

function checkPredictions(
  predictedSpectra: PredictedSpectraResult,
  inputOptions: PredictionOptions,
  molfile: string,
  logger: Logger,
) {
  const { spectra } = inputOptions;
  const missing2DPrediction: string[] = [];
  const molecule = Molecule.fromMolfile(molfile);
  const { atoms } = getAtoms(molecule);
  for (const entry of Object.entries(spectra)) {
    const [experiment, required] = entry as [Experiment, boolean];
    if (!required || predictedSpectra[experiment]) continue;
    let message = '';
    switch (experiment) {
      case 'proton': {
        message =
          atoms.H - nbLabileH(molecule) === 0
            ? 'No non-labile hydrogen found in the molecule, the proton spectrum could not be predicted'
            : `Proton was not predicted`;
        break;
      }
      case 'carbon': {
        message = `${experiment} was not predicted. ${
          !('C' in atoms) ? 'No carbons found in the molecule' : ''
        }`;
        break;
      }
      case 'cosy':
        message = !predictedSpectra.proton
          ? `Proton prediction is missing, so COSY experiment can not be simulated`
          : `There was a error in ${experiment.toUpperCase()} prediction`;
        break;
      case 'hsqc':
      case 'hmbc':
        if (!predictedSpectra[experiment]) {
          missing2DPrediction.push(experiment);
        }
        break;
      default:
        break;
    }
    if (message.length > 0) {
      logger.warn(message);
    }
  }
  if (missing2DPrediction.length > 0) {
    logger.warn(
      `Carbon or proton prediction are missing, so ${
        missing2DPrediction.length > 1
          ? missing2DPrediction.join(' and ')
          : missing2DPrediction[0]
      } can not be simulated`,
    );
  }
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

function initMoleculeViewProperties(
  draft: Draft<State>,
  options: {
    id: string;
    defaultMoleculeSettings?: MoleculeView;
    isMoleculeFloating?: boolean;
  },
) {
  const { id, isMoleculeFloating, defaultMoleculeSettings } = options;
  const { floating, ...otherDefaultOptions } = defaultMoleculeSettings || {};
  const {
    bounding = DRAGGABLE_STRUCTURE_INITIAL_BOUNDING_REACT,
    visible = false,
    ...other
  } = floating || {};
  // check if the molecule is exists in the view object otherwise add it with the default value
  if (!draft.view.molecules[id]) {
    const position = getFloatingMoleculeInitialPosition(id, draft);
    draft.view.molecules[id] = {
      atomAnnotation: 'none',
      showLabel: false,
      ...otherDefaultOptions,
      floating: {
        visible: isMoleculeFloating ?? visible,
        ...other,
        bounding: {
          ...bounding,
          ...position,
        },
      },
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

  let index: number;
  if (!molecules[id]) {
    index = moleculeKeys.length - 1;
  } else {
    index = moleculeKeys.indexOf(id);
  }
  const x = ((index + 1) % columns) * (width / columns) + left;
  const y = Math.floor(moleculeKeys.length / columns) * (height / rows) + top;
  return {
    x: convertPixelToPercent(x, displayerWidth),
    y: convertPixelToPercent(y, displayerHeight),
  };
}

//action
function handleFloatMoleculeOverSpectrum(
  draft: Draft<State>,
  action: ToggleMoleculeViewObjectAction,
) {
  const { id } = action.payload;

  initMoleculeViewProperties(draft, {
    id,
  });
  const view = getMoleculeViewObject(id, draft);
  view.floating.visible = !view.floating.visible;
}

//action
function handleChangeMoleculeAnnotation(
  draft: Draft<State>,
  action: ChangeMoleculeAnnotationAction,
) {
  const { id, atomAnnotation } = action.payload;

  initMoleculeViewProperties(draft, { id });
  const molecule = getMoleculeViewObject(id, draft);
  if (!molecule) return;

  molecule.atomAnnotation = atomAnnotation;
}

//action
function handleChangeFloatMoleculePosition(
  draft: Draft<State>,
  action: ChangeFloatMoleculePositionAction,
) {
  const { id, bounding } = action.payload;
  const molecule = getMoleculeViewObject(id, draft);
  if (!molecule) {
    throw new Error(`Molecule ${id} does not exist`);
  }

  molecule.floating.bounding = { ...molecule.floating.bounding, ...bounding };
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
//action
function handleToggleMoleculeLabel(
  draft: Draft<State>,
  action: ToggleMoleculeLabelAction,
) {
  const { id } = action.payload;
  const molecule = getMoleculeViewObject(id, draft);
  if (!molecule) {
    throw new Error(`Molecule ${id} does not exist`);
  }

  molecule.showLabel = !molecule.showLabel;
}

export {
  addMolecule,
  handleAddMolecule,
  handleAddMolecules,
  handleChangeFloatMoleculePosition,
  handleChangeMoleculeAnnotation,
  handleChangeMoleculeLabel,
  handleDeleteMolecule,
  handleFloatMoleculeOverSpectrum,
  handlePredictSpectraFromMolecule,
  handleSetMolecule,
  handleToggleMoleculeLabel,
  initMoleculeViewProperties,
};
