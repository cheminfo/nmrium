import { v4 } from '@lukeed/uuid';
import { Draft } from 'immer';
import { MatrixGenerationOptions } from 'nmr-load-save';

import { MatrixOptions } from '../../../../data/types/data1d/MatrixOptions';
import { ZoomOptions } from '../../../EventsTrackers/BrushTracker';
import { FilterType } from '../../../utility/filterType';
import { toScaleRatio } from '../../helper/Zoom1DManager';
import { ActionType } from '../../types/ActionType';
import { getMatrixGenerationDefaultOptions } from '../panelsPreferencesDefaultValues';
import { PreferencesState } from '../preferencesReducer';
import { getActiveWorkspace } from '../utilities/getActiveWorkspace';

type setMatrixGenerationOptionsAction = ActionType<
  'SET_MATRIX_GENERATION_OPTIONS',
  { nucleus: string; options: MatrixOptions }
>;
type addMatrixGenerationExclusionZoneAction = ActionType<
  'ADD_MATRIX_GENERATION_EXCLUSION_ZONE',
  {
    zone: {
      from: number;
      to: number;
    };
    range: { from: number; to: number };
    nucleus: string;
  }
>;
type deleteMatrixGenerationExclusionZoneAction = ActionType<
  'DELETE_MATRIX_GENERATION_EXCLUSION_ZONE',
  { zone: { id: string; from: number; to: number }; nucleus: string }
>;

type ToggleMatrixGenerationViewAction = ActionType<
  'TOGGLE_MATRIX_GENERATION_VIEW_PROPERTY',
  {
    key: keyof FilterType<MatrixGenerationOptions, boolean>;
    nucleus: string;
  }
>;
type ChangeMatrixGenerationScaleAction = ActionType<
  'CHANGE_MATRIX_GENERATION_SCALE',
  {
    zoomOptions: ZoomOptions;
    nucleus: string;
  }
>;
type ChangeMatrixGenerationStocsyChemicalShiftAction = ActionType<
  'CHANGE_MATRIX_GENERATION_STOCSY_CHEMICAL_SHIFT',
  {
    nucleus: string;
    chemicalShift: number;
  }
>;

export type MatrixGenerationActions =
  | ToggleMatrixGenerationViewAction
  | deleteMatrixGenerationExclusionZoneAction
  | addMatrixGenerationExclusionZoneAction
  | setMatrixGenerationOptionsAction
  | ChangeMatrixGenerationScaleAction
  | ChangeMatrixGenerationStocsyChemicalShiftAction;

function getMatrixGenerationPanelOptions(
  draft: Draft<PreferencesState>,
  nucleus: string,
) {
  initMatrixGeneration(draft, nucleus);

  const currentWorkspacePreferences = getActiveWorkspace(draft);
  const panels = currentWorkspacePreferences.panels;

  const matrixGeneration: MatrixGenerationOptions =
    panels.matrixGeneration?.[nucleus];

  return matrixGeneration;
}

function initMatrixGeneration(draft: Draft<PreferencesState>, nucleus: string) {
  const currentWorkspacePreferences = getActiveWorkspace(draft);
  const panels = currentWorkspacePreferences.panels;

  if (!panels.matrixGeneration?.[nucleus]) {
    const options: MatrixGenerationOptions =
      getMatrixGenerationDefaultOptions();

    panels.matrixGeneration = {
      ...panels.matrixGeneration,
      [nucleus]: options,
    };
  }
}

function addExclusionZone(
  draft: Draft<PreferencesState>,
  action: addMatrixGenerationExclusionZoneAction,
) {
  const { zone, range, nucleus } = action.payload;

  const matrixGeneration = getMatrixGenerationPanelOptions(draft, nucleus);

  if (!matrixGeneration) return;

  const exclusionZone = {
    id: v4(),
    ...zone,
  };
  matrixGeneration.matrixOptions.range = range;
  matrixGeneration.matrixOptions.exclusionsZones.push(exclusionZone);
}

function deleteExclusionZone(draft: Draft<PreferencesState>, action) {
  const { zone, nucleus } = action.payload;
  const matrixGeneration = getMatrixGenerationPanelOptions(draft, nucleus);

  if (!matrixGeneration) return;

  const options: MatrixOptions = matrixGeneration.matrixOptions;
  options.exclusionsZones = options.exclusionsZones.filter(
    (_zone) => _zone.id !== zone.id,
  );
}

function setMatrixGenerationOptions(draft: Draft<PreferencesState>, action) {
  const { options, nucleus } = action.payload;
  const matrixGeneration = getMatrixGenerationPanelOptions(draft, nucleus);

  matrixGeneration.matrixOptions = options;
}

function toggleMatrixGenerationViewProperty(
  draft: Draft<PreferencesState>,
  action: ToggleMatrixGenerationViewAction,
) {
  const { key, nucleus } = action.payload;

  const matrixGeneration = getMatrixGenerationPanelOptions(draft, nucleus);

  if (!matrixGeneration) return;

  matrixGeneration[key] = !matrixGeneration[key];
}

function changeMatrixGenerationScale(
  draft: Draft<PreferencesState>,
  action: ChangeMatrixGenerationScaleAction,
) {
  const { zoomOptions, nucleus } = action.payload;

  const matrixGeneration = getMatrixGenerationPanelOptions(draft, nucleus);

  if (!matrixGeneration) return;

  const scaleRatio = toScaleRatio(zoomOptions);

  matrixGeneration.scaleRatio *= scaleRatio;
}
function changeMatrixGenerationStocsyChemicalShift(
  draft: Draft<PreferencesState>,
  action: ChangeMatrixGenerationStocsyChemicalShiftAction,
) {
  const { chemicalShift, nucleus } = action.payload;

  const matrixGeneration = getMatrixGenerationPanelOptions(draft, nucleus);

  if (!matrixGeneration) return null;

  matrixGeneration.chemicalShift = chemicalShift;
}

export {
  addExclusionZone,
  deleteExclusionZone,
  setMatrixGenerationOptions,
  toggleMatrixGenerationViewProperty,
  changeMatrixGenerationScale,
  changeMatrixGenerationStocsyChemicalShift,
};
