import { Draft, produce } from 'immer';
import {
  MultipleSpectraAnalysisPreferences,
  Workspace,
  WorkSpaceSource,
} from 'nmr-load-save';
import { Reducer } from 'react';
import { SplitPaneSize } from 'react-science/ui';

import { MatrixOptions } from '../../../data/types/data1d/MatrixOptions';
import type { NMRiumWorkspace, NMRiumPreferences } from '../../main';
import {
  getLocalStorage,
  removeData,
  storeData,
} from '../../utility/LocalStorage';
import Workspaces from '../../workspaces';
import { ActionType } from '../types/ActionType';

import { addWorkspace } from './actions/addWorkspace';
import {
  analyzeSpectra,
  changeAnalysisColumnValueKey,
  deleteAnalysisColumn,
  setSpectraAnalysisPanelsPreferences,
} from './actions/analyzeSpectra';
import { applyGeneralPreferences } from './actions/applyGeneralPreferences';
import { initPreferences } from './actions/initPreferences';
import {
  setMatrixGenerationOptions,
  addExclusionZone,
  deleteExclusionZone,
} from './actions/matrixGeneration';
import { removeWorkspace } from './actions/removeWorkspace';
import { setActiveWorkspace } from './actions/setActiveWorkspace';
import { setPanelsPreferences } from './actions/setPanelsPreferences';
import { setPreferences } from './actions/setPreferences';
import { setVerticalSplitterPosition } from './actions/setVerticalSplitterPosition';
import { setWorkspace } from './actions/setWorkspace';
import { mapWorkspaces } from './utilities/mapWorkspaces';

const LOCAL_STORAGE_VERSION = 17;

export const WORKSPACES_KEYS = {
  componentKey: `nmrium-component-workspace`,
  nmriumKey: `nmrium-file-workspace`,
};

type InitPreferencesAction = ActionType<
  'INIT_PREFERENCES',
  {
    display: NMRiumPreferences;
    workspace: NMRiumWorkspace;
    customWorkspaces: Record<string, Workspace>;
    dispatch: any;
  }
>;
type SetPreferencesAction =
  | ActionType<'SET_PREFERENCES', Partial<Workspace>>
  | ActionType<'SET_PREFERENCES'>;
type SetPanelsPreferencesAction = ActionType<
  'SET_PANELS_PREFERENCES',
  { key: string; value: string }
>;

export type SetWorkspaceAction = ActionType<
  'SET_WORKSPACE',
  | { workspaceSource: 'any'; workspace: string }
  | { workspaceSource: 'nmriumFile'; data: Workspace }
>;
export type WorkspaceAction = ActionType<
  'REMOVE_WORKSPACE' | 'SET_ACTIVE_WORKSPACE',
  { workspace: string }
>;
export type AddWorkspaceAction = ActionType<
  'ADD_WORKSPACE',
  { workspaceKey: string; data?: Omit<Workspace, 'version' | 'label'> }
>;
export type ApplyGeneralPreferences = ActionType<
  'APPLY_General_PREFERENCES',
  { data: Omit<Workspace, 'version' | 'label'> }
>;
export type AnalyzeSpectraAction = ActionType<
  'ANALYZE_SPECTRA',
  { start: number; end: number; nucleus: string; columnKey?: string }
>;
export type ChangeAnalysisColumnValueKeyAction = ActionType<
  'CHANGE_ANALYSIS_COLUMN_VALUE_KEY',
  { columnKey: string; valueKey: string; nucleus: string }
>;
export type DeleteAnalysisColumn = ActionType<
  'DELETE_ANALYSIS_COLUMN',
  { columnKey: string; nucleus: string }
>;
export type SetSpectraAnalysisPanelPreferencesAction = ActionType<
  'SET_SPECTRA_ANALYSIS_PREFERENCES',
  { nucleus: string; data: MultipleSpectraAnalysisPreferences }
>;
export type setMatrixGenerationOptionsAction = ActionType<
  'SET_MATRIX_GENERATION_OPTIONS',
  { nucleus: string; options: MatrixOptions }
>;
export type addMatrixGenerationExclusionZoneAction = ActionType<
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
export type deleteMatrixGenerationExclusionZoneAction = ActionType<
  'DELETE_MATRIX_GENERATION_EXCLUSION_ZONE',
  { zone: { id: string; from: number; to: number }; nucleus: string }
>;
export type SetVerticalSplitterPositionAction = ActionType<
  'SET_VERTICAL_SPLITTER_POSITION',
  { value: SplitPaneSize }
>;

type PreferencesActions =
  | InitPreferencesAction
  | SetPreferencesAction
  | SetPanelsPreferencesAction
  | SetWorkspaceAction
  | WorkspaceAction
  | AddWorkspaceAction
  | ApplyGeneralPreferences
  | AnalyzeSpectraAction
  | ChangeAnalysisColumnValueKeyAction
  | DeleteAnalysisColumn
  | SetSpectraAnalysisPanelPreferencesAction
  | setMatrixGenerationOptionsAction
  | addMatrixGenerationExclusionZoneAction
  | deleteMatrixGenerationExclusionZoneAction
  | SetVerticalSplitterPositionAction;

export const WORKSPACES: Array<{
  key: NMRiumWorkspace;
  label: string;
}> = [
  {
    key: 'default',
    label: Workspaces.default.label,
  },
  {
    key: 'process1D',
    label: Workspaces.process1D.label,
  },
  {
    key: 'exercise',
    label: Workspaces.exercise.label,
  },
  {
    key: 'prediction',
    label: Workspaces.prediction.label,
  },
  {
    key: 'assignment',
    label: Workspaces.assignment.label,
  },
  {
    key: 'embedded',
    label: Workspaces.embedded.label,
  },
  {
    key: 'simulation',
    label: Workspaces.simulation.label,
  },
];

export type WorkspaceWithSource = Workspace & { source: WorkSpaceSource };
export type WorkspacesWithSource =
  | Record<NMRiumWorkspace, WorkspaceWithSource>
  | Record<string, WorkspaceWithSource>;

export interface PreferencesState {
  version: number;
  workspaces: WorkspacesWithSource;
  originalWorkspaces: WorkspacesWithSource;
  dispatch: (action?: PreferencesActions) => void;
  workspace: {
    current: NMRiumWorkspace;
    base: NMRiumWorkspace | null;
  };
}

export const preferencesInitialState: PreferencesState = {
  version: LOCAL_STORAGE_VERSION,
  workspaces: {},
  originalWorkspaces: {},
  dispatch: () => null,
  workspace: {
    current: 'default',
    base: null,
  },
};

export function initPreferencesState(
  state: PreferencesState,
): PreferencesState {
  const nmrLocalStorageVersion = getLocalStorage(
    'nmr-local-storage-version',
    false,
  );

  const localData = getLocalStorage('nmr-general-settings');

  // remove old nmr-local-storage-version key
  if (nmrLocalStorageVersion && localData?.version) {
    removeData('nmr-local-storage-version');
  }

  //  if the local setting version != current settings version number
  if (!localData?.version || localData?.version !== LOCAL_STORAGE_VERSION) {
    removeData('nmr-general-settings');

    const data = {
      version: LOCAL_STORAGE_VERSION,
      workspaces: {},
    };
    storeData('nmr-general-settings', JSON.stringify(data));
  }

  const predefinedWorkspaces = mapWorkspaces(Workspaces as any, {
    source: 'predefined',
  });
  const localWorkspaces = mapWorkspaces(localData?.workspaces || {}, {
    source: 'user',
  });

  return {
    ...state,
    originalWorkspaces: { ...predefinedWorkspaces, ...localWorkspaces },
    workspaces: { ...predefinedWorkspaces, ...localWorkspaces },
    workspace: {
      current: localData?.currentWorkspace || 'default',
      base: null,
    },
  };
}

function innerPreferencesReducer(
  draft: Draft<PreferencesState>,
  action: PreferencesActions,
) {
  switch (action.type) {
    case 'INIT_PREFERENCES':
      return initPreferences(draft, action);
    case 'SET_PREFERENCES':
      return setPreferences(draft, action);
    case 'SET_PANELS_PREFERENCES':
      return setPanelsPreferences(draft, action);
    case 'SET_WORKSPACE':
      return setWorkspace(draft, action);
    case 'SET_ACTIVE_WORKSPACE':
      return setActiveWorkspace(draft, action);
    case 'ADD_WORKSPACE':
      return addWorkspace(draft, action);
    case 'REMOVE_WORKSPACE':
      return removeWorkspace(draft, action);
    case 'APPLY_General_PREFERENCES':
      return applyGeneralPreferences(draft, action);
    case 'ANALYZE_SPECTRA':
      return analyzeSpectra(draft, action);
    case 'CHANGE_ANALYSIS_COLUMN_VALUE_KEY':
      return changeAnalysisColumnValueKey(draft, action);
    case 'DELETE_ANALYSIS_COLUMN':
      return deleteAnalysisColumn(draft, action);
    case 'SET_SPECTRA_ANALYSIS_PREFERENCES':
      return setSpectraAnalysisPanelsPreferences(draft, action);
    case 'SET_MATRIX_GENERATION_OPTIONS':
      return setMatrixGenerationOptions(draft, action);
    case 'ADD_MATRIX_GENERATION_EXCLUSION_ZONE':
      return addExclusionZone(draft, action);
    case 'DELETE_MATRIX_GENERATION_EXCLUSION_ZONE':
      return deleteExclusionZone(draft, action);
    case 'SET_VERTICAL_SPLITTER_POSITION':
      return setVerticalSplitterPosition(draft, action);

    default:
      return draft;
  }
}
const preferencesReducer: Reducer<PreferencesState, any> = produce(
  innerPreferencesReducer,
);

export default preferencesReducer;
