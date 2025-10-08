import type {
  ACSExportOptions,
  ExportPreferences,
  ExportSettings,
  MultipleSpectraAnalysisPreferences,
  NMRiumPanelPreferences,
  PanelPreferencesType,
  PanelsPreferences,
  PrintPageOptions,
  WorkSpaceSource,
  Workspace,
} from '@zakodium/nmrium-core';
import { CURRENT_EXPORT_VERSION, migrateSettings } from '@zakodium/nmrium-core';
import type { Draft } from 'immer';
import { produce } from 'immer';
import type { Reducer } from 'react';
import type { SplitPaneSize } from 'react-science/ui';

import type { NMRiumPreferences, NMRiumWorkspace } from '../../main/index.js';
import { getLocalStorage, storeData } from '../../utility/LocalStorage.js';
import Workspaces from '../../workspaces/index.js';
import type { ActionType } from '../types/ActionType.js';

import { addWorkspace } from './actions/addWorkspace.js';
import {
  analyzeSpectra,
  changeAnalysisColumnValueKey,
  deleteAnalysisColumn,
  setSpectraAnalysisPanelsPreferences,
} from './actions/analyzeSpectra.js';
import { applyGeneralPreferences } from './actions/applyGeneralPreferences.js';
import { changeExportAcsSettings } from './actions/changeExportAcsSettings.ts';
import { changeExportSettings } from './actions/changeExportSettings.js';
import { changeInformationBlockPosition } from './actions/changeInformationBlockPosition.js';
import { changePeaksLabelPosition } from './actions/changePeaksLabelPosition.js';
import { changePrintPageSettings } from './actions/changePrintPageSettings.js';
import { initPreferences } from './actions/initPreferences.js';
import type { MatrixGenerationActions } from './actions/matrixGeneration.js';
import {
  addExclusionZone,
  changeMatrixGenerationScale,
  changeMatrixGenerationStocsyChemicalShift,
  deleteExclusionZone,
  setMatrixGenerationOptions,
  toggleMatrixGenerationViewProperty,
} from './actions/matrixGeneration.js';
import { removeWorkspace } from './actions/removeWorkspace.js';
import { setActiveWorkspace } from './actions/setActiveWorkspace.js';
import { setPanelsPreferences } from './actions/setPanelsPreferences.js';
import { setPreferences } from './actions/setPreferences.js';
import { setVerticalSplitterPosition } from './actions/setVerticalSplitterPosition.js';
import { setWorkspace } from './actions/setWorkspace.js';
import { toggleInformationBlock } from './actions/toggleInformationBlock.js';
import { togglePanel } from './actions/togglePanel.js';
import { mapWorkspaces } from './utilities/mapWorkspaces.js';

const LOCAL_STORAGE_SETTINGS_KEY = 'nmr-general-settings';

export const WORKSPACES_KEYS = {
  componentKey: `nmrium-component-workspace`,
  nmriumKey: `nmrium-file-workspace`,
};

export interface Settings {
  version: number;
  workspaces: Record<string, WorkspaceWithSource>;
  currentWorkspace: any;
}

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

export type SetPanelsPreferencesAction = ActionType<
  'SET_PANELS_PREFERENCES',
  { key: keyof PanelsPreferences; value: any }
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

export type SetVerticalSplitterPositionAction = ActionType<
  'SET_VERTICAL_SPLITTER_POSITION',
  { value: SplitPaneSize }
>;
export type ChangeInformationBlockPosition = ActionType<
  'CHANGE_INFORMATION_BLOCK_POSITION',
  {
    coordination: { x: number; y: number };
  }
>;

export type ToggleInformationBlock = ActionType<
  'TOGGLE_INFORMATION_BLOCK',
  {
    visible?: boolean;
  }
>;
export type ChangePrintPageSettingsAction = ActionType<
  'CHANGE_PRINT_PAGE_SETTINGS',
  PrintPageOptions
>;
export type ChangeExportSettingsAction = ActionType<
  'CHANGE_EXPORT_SETTINGS',
  {
    key: keyof ExportPreferences;
    options: ExportSettings;
  }
>;

export type ChangeExportACSSettingsAction = ActionType<
  'CHANGE_EXPORT_ACS_SETTINGS',
  { options: ACSExportOptions; nucleus: string }
>;
export type ChangePeaksLabelPositionAction = ActionType<
  'CHANGE_PEAKS_LABEL_POSITION',
  {
    marginTop: number;
  }
>;

export type TogglePanelAction = ActionType<
  'TOGGLE_PANEL',
  {
    id: keyof NMRiumPanelPreferences;
    options: Partial<PanelPreferencesType>;
  }
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
  | MatrixGenerationActions
  | SetVerticalSplitterPositionAction
  | ChangeInformationBlockPosition
  | ToggleInformationBlock
  | ChangePrintPageSettingsAction
  | ChangeExportSettingsAction
  | ChangePeaksLabelPositionAction
  | TogglePanelAction
  | ChangeExportACSSettingsAction;

export type WorkspaceWithSource = Workspace & { source: WorkSpaceSource };
type WorkspacesWithSource = Record<string, WorkspaceWithSource>;

export interface PreferencesState {
  version: number;
  // TODO: A lot of places set this to Required<WorkspacePreferences>, which is a subset of this type
  workspaces: WorkspacesWithSource;
  originalWorkspaces: WorkspacesWithSource;
  dispatch: (action?: PreferencesActions) => void;
  workspace: {
    current: NMRiumWorkspace;
    base: NMRiumWorkspace | null;
  };
}

export const preferencesInitialState: PreferencesState = {
  version: CURRENT_EXPORT_VERSION,
  workspaces: {},
  originalWorkspaces: {},
  dispatch: () => null,
  workspace: {
    current: 'default',
    base: null,
  },
};

export function readSettings(): Settings {
  const localData = getLocalStorage(LOCAL_STORAGE_SETTINGS_KEY) || {
    version: CURRENT_EXPORT_VERSION,
    currentWorkspace: null,
    workspaces: {},
  };
  return migrateSettings(localData);
}

export function updateSettings(settings: Settings) {
  storeData(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(settings));
}

export function initPreferencesState(
  state: PreferencesState,
): PreferencesState {
  const localData = getLocalStorage(LOCAL_STORAGE_SETTINGS_KEY);
  const settings = readSettings();
  //  if the local setting version != current settings version number
  if (localData?.version !== CURRENT_EXPORT_VERSION) {
    updateSettings(settings);
  }

  const predefinedWorkspaces = mapWorkspaces(Workspaces as any, {
    source: 'predefined',
  });
  const localWorkspaces = mapWorkspaces(settings?.workspaces || {}, {
    source: 'user',
  });

  return {
    ...state,
    originalWorkspaces: { ...predefinedWorkspaces, ...localWorkspaces } as any,
    workspaces: { ...predefinedWorkspaces, ...localWorkspaces } as any,
    workspace: {
      current: settings?.currentWorkspace || 'default',
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
    case 'TOGGLE_MATRIX_GENERATION_VIEW_PROPERTY':
      return toggleMatrixGenerationViewProperty(draft, action);
    case 'SET_VERTICAL_SPLITTER_POSITION':
      return setVerticalSplitterPosition(draft, action);
    case 'CHANGE_MATRIX_GENERATION_SCALE':
      return changeMatrixGenerationScale(draft, action);
    case 'CHANGE_MATRIX_GENERATION_STOCSY_CHEMICAL_SHIFT':
      return changeMatrixGenerationStocsyChemicalShift(draft, action);
    case 'CHANGE_INFORMATION_BLOCK_POSITION':
      return changeInformationBlockPosition(draft, action);
    case 'TOGGLE_INFORMATION_BLOCK':
      return toggleInformationBlock(draft, action);
    case 'CHANGE_PRINT_PAGE_SETTINGS':
      return changePrintPageSettings(draft, action);
    case 'CHANGE_EXPORT_SETTINGS':
      return changeExportSettings(draft, action);
    case 'CHANGE_PEAKS_LABEL_POSITION':
      return changePeaksLabelPosition(draft, action);
    case 'TOGGLE_PANEL':
      return togglePanel(draft, action);
    case 'CHANGE_EXPORT_ACS_SETTINGS':
      return changeExportAcsSettings(draft, action);

    default:
      return draft;
  }
}
const preferencesReducer: Reducer<PreferencesState, any> = produce(
  innerPreferencesReducer,
);

export default preferencesReducer;
