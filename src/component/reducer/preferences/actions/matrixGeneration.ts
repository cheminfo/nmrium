import type { MatrixOptions } from '@zakodium/nmr-types';
import type { MatrixGenerationOptions } from '@zakodium/nmrium-core';
import type { Draft } from 'immer';

import type { ZoomOptions } from '../../../EventsTrackers/BrushTracker.js';
import type { FilterType } from '../../../utility/filterType.js';
import { toScaleRatio } from '../../helper/Zoom1DManager.js';
import type { ActionType } from '../../types/ActionType.js';
import { getMatrixGenerationDefaultOptions } from '../panelsPreferencesDefaultValues.js';
import type { PreferencesState } from '../preferencesReducer.js';
import { getActiveWorkspace } from '../utilities/getActiveWorkspace.js';

type setMatrixGenerationOptionsAction = ActionType<
  'SET_MATRIX_GENERATION_OPTIONS',
  { nucleus: string; options: MatrixOptions<object> }
>;
type addMatrixGenerationExclusionZoneAction = ActionType<
  'ADD_MATRIX_GENERATION_EXCLUSION_ZONE',
  {
    zone: {
      from: number;
      to: number;
    };
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

  return panels.matrixGeneration?.[nucleus] || null;
}

function initMatrixGeneration(draft: Draft<PreferencesState>, nucleus: string) {
  const currentWorkspacePreferences = getActiveWorkspace(draft);
  const panels = currentWorkspacePreferences.panels;

  if (!panels.matrixGeneration?.[nucleus]) {
    const options = getMatrixGenerationDefaultOptions();
    panels.matrixGeneration = {
      ...panels.matrixGeneration,
      [nucleus]: options,
    };
  }

  return panels.matrixGeneration;
}

function addExclusionZone(
  draft: Draft<PreferencesState>,
  action: addMatrixGenerationExclusionZoneAction,
) {
  const { zone, nucleus } = action.payload;

  const matrixGeneration = getMatrixGenerationPanelOptions(draft, nucleus);

  if (!matrixGeneration) return;

  const exclusionZone = {
    id: crypto.randomUUID(),
    ...zone,
  };
  matrixGeneration.matrixOptions.exclusionsZones.push(exclusionZone);
}

function deleteExclusionZone(draft: Draft<PreferencesState>, action: any) {
  const { zone, nucleus } = action.payload;
  const matrixGeneration = getMatrixGenerationPanelOptions(draft, nucleus);

  if (!matrixGeneration) return;

  const options = matrixGeneration.matrixOptions;
  options.exclusionsZones = options.exclusionsZones.filter(
    (_zone) => _zone.id !== zone.id,
  );
}

function setMatrixGenerationOptions(
  draft: Draft<PreferencesState>,
  action: any,
) {
  const { options, nucleus } = action.payload;
  const matrixGeneration = getMatrixGenerationPanelOptions(draft, nucleus);

  if (!matrixGeneration) {
    return;
  }

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
  const { deltaY, invertScroll } = zoomOptions;
  const scaleRatio = toScaleRatio({ delta: deltaY, invertScroll });

  matrixGeneration.scaleRatio *= scaleRatio;
}
function changeMatrixGenerationStocsyChemicalShift(
  draft: Draft<PreferencesState>,
  action: ChangeMatrixGenerationStocsyChemicalShiftAction,
): void {
  const { chemicalShift, nucleus } = action.payload;

  const matrixGeneration = getMatrixGenerationPanelOptions(draft, nucleus);

  if (!matrixGeneration) return;

  matrixGeneration.chemicalShift = chemicalShift;
}

export {
  addExclusionZone,
  changeMatrixGenerationScale,
  changeMatrixGenerationStocsyChemicalShift,
  deleteExclusionZone,
  setMatrixGenerationOptions,
  toggleMatrixGenerationViewProperty,
};
