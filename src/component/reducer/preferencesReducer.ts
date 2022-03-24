import { Draft, produce, original } from 'immer';
import lodashMerge from 'lodash/merge';

import generateID from '../../data/utilities/generateID';
import { NMRiumWorkspace, NMRiumPreferences } from '../NMRium';
import {
  getLocalStorage,
  removeData,
  storeData,
} from '../utility/LocalStorage';
import Workspaces from '../workspaces';
import { Workspace } from '../workspaces/Workspace';

import { ActionType } from './types/Types';

type InitPreferencesAction = ActionType<
  'INIT_PREFERENCES',
  { display: NMRiumPreferences; workspace: NMRiumWorkspace; dispatch: any }
>;
type SetPreferencesAction = ActionType<
  'SET_PREFERENCES',
  Omit<Workspace, 'version' | 'label'>
>;
type SetPanelsPreferencesAction = ActionType<
  'SET_PANELS_PREFERENCES',
  { key: string; value: string }
>;

type WorkspaceAction = ActionType<
  'SET_WORKSPACE' | 'REMOVE_WORKSPACE',
  { workspace: string }
>;
type AddWorkspaceAction = ActionType<
  'ADD_WORKSPACE',
  { workspace: string; data: Omit<Workspace, 'version' | 'label'> }
>;

type PreferencesActions =
  | InitPreferencesAction
  | SetPreferencesAction
  | ActionType<'RESET_PREFERENCES'>
  | SetPanelsPreferencesAction
  | WorkspaceAction
  | AddWorkspaceAction;

const LOCAL_STORAGE_VERSION = 5;

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
];

function getPreferencesByWorkspace(workspace: NMRiumWorkspace) {
  switch (workspace) {
    case 'exercise':
      return Workspaces.exercise;
    case 'process1D':
      return Workspaces.process1D;
    case 'prediction':
      return Workspaces.prediction;
    case 'default':
      return Workspaces.default;
    default:
      return {} as Workspace;
  }
}

export interface PreferencesState {
  version: number;
  workspaces: Record<string, Workspace>;
  dispatch: (action?: PreferencesActions) => void;
  workspace: {
    current: NMRiumWorkspace;
    base: NMRiumWorkspace | null;
  };
}

function getActiveWorkspace(draft: Draft<PreferencesState>) {
  return draft.workspaces[draft.workspace.current || 'default'];
}

export const preferencesInitialState: PreferencesState = {
  version: LOCAL_STORAGE_VERSION,
  workspaces: {},
  dispatch: () => null,
  workspace: {
    current: 'default',
    base: null,
  },
};

function filterObject(data: any) {
  return JSON.parse(JSON.stringify(data), (key, value) => {
    if (value?.hidden !== true) {
      return value;
    }
  });
}
function FlatObject(data: any) {
  let result = {};
  JSON.parse(JSON.stringify(data), (key, value) => {
    if (value?.hidden !== true && key) {
      result[key] = result[key]++ || 1;
    }
  });
  return result;
}

function checkKeysExists(sourceObject, targetObject) {
  const source = FlatObject(sourceObject);
  const target = FlatObject(targetObject);

  if (Object.keys(target).length === 0) {
    return false;
  }

  for (const [key, value] of Object.entries(source)) {
    if (!target[key] || target[key] !== value) {
      return false;
    }
  }

  return true;
}

function mapNucleus(draft: Draft<PreferencesState>) {
  const currentWorkspacePreferences = getActiveWorkspace(draft);

  if (
    currentWorkspacePreferences.formatting.nucleus &&
    Array.isArray(currentWorkspacePreferences.formatting.nucleus)
  ) {
    currentWorkspacePreferences.formatting.nucleusByKey =
      currentWorkspacePreferences.formatting.nucleus.reduce((acc, item) => {
        acc[item.name.toLowerCase()] = item;
        return { ...acc };
      }, {});
  }
}

export function initPreferencesState(
  state: PreferencesState,
): PreferencesState {
  const nmrLocalStorageVersion = getLocalStorage(
    'nmr-local-storage-version',
    false,
  );

  let localData = getLocalStorage('nmr-general-settings');

  // remove old nmr-local-storage-version key
  if (nmrLocalStorageVersion && localData?.version) {
    removeData('nmr-local-storage-version');
  }

  //  if the local setting version != current settings version number
  if (!localData?.version || localData?.version !== LOCAL_STORAGE_VERSION) {
    removeData('nmr-general-settings');
  }
  return {
    ...state,
    workspaces: localData?.workspaces || { default: Workspaces.default },
  };
}

function handleInit(draft: Draft<PreferencesState>, action) {
  if (action.payload) {
    const localData = getLocalStorage('nmr-general-settings');

    const { dispatch, workspace, ...resProps } = action.payload;
    /**
     * set the current workspace what the user-defined in the setting if the workspace is not defined at the level of component, otherwise
     * use the default workspace
     *
     */
    draft.workspace =
      !workspace && localData?.currentWorkspace
        ? { current: localData.currentWorkspace, base: null }
        : { current: workspace || 'default', base: workspace };

    const workspacePreferences = lodashMerge(
      {},
      getPreferencesByWorkspace(draft.workspace.current),
      resProps,
    );
    const currentWorkspacePreferences = getActiveWorkspace(draft);

    /**
     * Update the local storage general preferences
     * 1- if local storage is empty.
     * 2- if predefine workspaces.
     * 3- b) if workspace not exists in the local storage
     *    c) if the local setting workspace version != current workspace version number
     *    d) if hard code workspace parameters !=  current workspace parameters
     */
    if (
      (Workspaces[draft.workspace.current] &&
        (!currentWorkspacePreferences ||
          workspacePreferences?.version !==
            currentWorkspacePreferences?.version ||
          !checkKeysExists(
            workspacePreferences.display,
            currentWorkspacePreferences?.display,
          ))) ||
      !localData
    ) {
      const { workspaces, version } = draft || {};
      const display = filterObject(workspacePreferences.display);

      const data = {
        version,
        workspaces: {
          ...workspaces,
          [draft.workspace.current]: {
            ...workspacePreferences,
            display,
          },
        },
      };
      draft.workspaces[draft.workspace.current] = lodashMerge(
        {},
        currentWorkspacePreferences,
        workspacePreferences,
      );
      storeData('nmr-general-settings', JSON.stringify(data));
    } else {
      currentWorkspacePreferences.display = lodashMerge(
        {},
        workspacePreferences.display,
        currentWorkspacePreferences.display,
      );
    }

    draft.dispatch = dispatch;
  }
}

function handleSetPreferences(draft: Draft<PreferencesState>, action) {
  if (action.payload) {
    const currentWorkspacePreferences = getActiveWorkspace(draft);

    const { controllers, formatting, display } = action.payload;

    let localData = getLocalStorage('nmr-general-settings');
    localData.currentWorkspace = draft.workspace.current;
    localData.workspaces = {
      ...localData.workspaces,
      [draft.workspace.current]: {
        ...localData.workspaces[draft.workspace.current],
        controllers,
        formatting,
        display,
      },
    };

    storeData('nmr-general-settings', JSON.stringify(localData));

    currentWorkspacePreferences.controllers = controllers;
    currentWorkspacePreferences.formatting = formatting;
    currentWorkspacePreferences.display = {
      ...currentWorkspacePreferences.display,
      panels: display.panels,
      general: {
        ...(currentWorkspacePreferences.display.general || {}),
        experimentalFeatures: display.general.experimentalFeatures,
      },
    };
    mapNucleus(draft);
  }
}
function handleSetPanelsPreferences(draft: Draft<PreferencesState>, action) {
  if (action.payload) {
    const currentWorkspacePreferences = getActiveWorkspace(draft);

    const { key, value } = action.payload;
    let localData = getLocalStorage('nmr-general-settings');
    localData.workspaces[draft.workspace.current].formatting.panels[key] =
      value;
    storeData('nmr-general-settings', JSON.stringify(localData));
    currentWorkspacePreferences.formatting.panels[key] = value;
  }
}
function handleResetPreferences(draft: Draft<PreferencesState>) {
  const currentWorkspacePreferences = getActiveWorkspace(draft);
  let localData = getLocalStorage('nmr-general-settings');
  const workSpaceDisplayPreferences = getPreferencesByWorkspace(
    draft.workspace.current,
  ).display;

  if (localData.workspaces[draft.workspace.current]) {
    localData.workspaces[draft.workspace.current].display =
      workSpaceDisplayPreferences;
    storeData('nmr-general-settings', JSON.stringify(localData));
  }
  currentWorkspacePreferences.display = workSpaceDisplayPreferences;
}
function handleSetWorkspace(
  draft: Draft<PreferencesState>,
  action: WorkspaceAction,
) {
  const workspaceKey = action.payload.workspace;
  if (!draft.workspaces[workspaceKey]) {
    draft.workspaces[workspaceKey] = getPreferencesByWorkspace(
      workspaceKey as NMRiumWorkspace,
    );
  }
  draft.workspace.current = workspaceKey as NMRiumWorkspace;
}
function handleAddWorkspace(
  draft: Draft<PreferencesState>,
  action: AddWorkspaceAction,
) {
  const {
    workspace: workspaceName,
    data: { display, controllers, formatting },
  } = action.payload;
  const newWorkSpace = {
    version: 1,
    label: workspaceName,
    display,
    controllers,
    formatting,
  };
  const newWorkspaceKey = generateID();
  const localData = getLocalStorage('nmr-general-settings');

  localData.workspaces[newWorkspaceKey] = newWorkSpace;
  storeData('nmr-general-settings', JSON.stringify(localData));
  draft.workspaces[newWorkspaceKey] = newWorkSpace;
  draft.workspace.current = newWorkspaceKey as any;
}
function handleRemoveWorkspace(
  draft: Draft<PreferencesState>,
  action: WorkspaceAction,
) {
  const { workspace } = action.payload;

  if (workspace === draft.workspace.current) {
    draft.workspace.current = 'default';
  }

  let localData = getLocalStorage('nmr-general-settings');
  const storedWorkspaces = original(draft)?.workspaces || {};
  const workspaces = Object.keys(storedWorkspaces).reduce((acc, key) => {
    if (key !== workspace) {
      acc[key] = storedWorkspaces[key];
    }
    return acc;
  }, {});
  draft.workspaces = workspaces;
  localData.workspaces = filterObject(workspaces);
  storeData('nmr-general-settings', JSON.stringify(localData));
}

function innerPreferencesReducer(
  draft: Draft<PreferencesState>,
  action: PreferencesActions,
) {
  switch (action.type) {
    case 'INIT_PREFERENCES':
      return handleInit(draft, action);
    case 'SET_PREFERENCES':
      return handleSetPreferences(draft, action);
    case 'SET_PANELS_PREFERENCES':
      return handleSetPanelsPreferences(draft, action);
    case 'RESET_PREFERENCES':
      return handleResetPreferences(draft);
    case 'SET_WORKSPACE':
      return handleSetWorkspace(draft, action);
    case 'ADD_WORKSPACE':
      return handleAddWorkspace(draft, action);
    case 'REMOVE_WORKSPACE':
      return handleRemoveWorkspace(draft, action);
    default:
      return draft;
  }
}
const preferencesReducer = produce(innerPreferencesReducer);

export default preferencesReducer;
