import { Draft, produce, original } from 'immer';
import lodashMerge from 'lodash/merge';

import generateID from '../../data/utilities/generateID';
import { NMRIumWorkspace, NMRiumPreferences } from '../NMRium';
import {
  getLocalStorage,
  removeData,
  storeData,
} from '../utility/LocalStorage';
import workspaces from '../workspaces';
import { Workspace } from '../workspaces/Workspace';

import { ActionType } from './types/Types';

type InitPreferencesAction = ActionType<
  'INIT_PREFERENCES',
  { display: NMRiumPreferences; workspace: NMRIumWorkspace; dispatch: any }
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

const LOCAL_STORAGE_VERSION = 4;

export const WORKSPACES: Array<{
  key: NMRIumWorkspace;
  label: string;
}> = [
  {
    key: 'default',
    label: workspaces.default.label,
  },
  {
    key: 'process1D',
    label: workspaces.process1D.label,
  },
  {
    key: 'exercise1D',
    label: workspaces.exercise1D.label,
  },
  {
    key: 'prediction',
    label: workspaces.prediction.label,
  },
];

function getPreferencesByWorkspace(workspace: NMRIumWorkspace) {
  switch (workspace) {
    case 'exercise1D':
      return workspaces.exercise1D;
    case 'process1D':
      return workspaces.process1D;
    case 'prediction':
      return workspaces.prediction;
    case 'default':
      return workspaces.default;
    default:
      return {} as Workspace;
  }
}

export interface PreferencesState {
  version: number;
  workspaces: Record<string, Workspace>;
  dispatch: (action?: PreferencesActions) => void;
  currentWorkspace: NMRIumWorkspace;
}

function getActiveWorkspace(draft: Draft<PreferencesState>) {
  return draft.workspaces[draft.currentWorkspace || 'default'];
}

export const preferencesInitialState: PreferencesState = {
  version: LOCAL_STORAGE_VERSION,
  workspaces: {},
  dispatch: () => null,
  currentWorkspace: 'default',
};

function filterObject(data: any) {
  return JSON.parse(JSON.stringify(data), (key, value) => {
    if (value !== 'hide') {
      return value;
    }
  });
}
function FlatObject(data: any) {
  let result = {};
  JSON.parse(JSON.stringify(data), (key, value) => {
    if (value !== 'hide' && key) {
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
  const workspace = getActiveWorkspace(draft);

  if (
    workspace.formatting.nucleus &&
    Array.isArray(workspace.formatting.nucleus)
  ) {
    workspace.formatting.nucleusByKey = workspace.formatting.nucleus.reduce(
      (acc, item) => {
        acc[item.name.toLowerCase()] = item;
        return { ...acc };
      },
      {},
    );
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

  if (!localData?.version || localData?.version !== LOCAL_STORAGE_VERSION) {
    removeData('nmr-general-settings');
  }

  return {
    ...state,
    version: localData?.version || LOCAL_STORAGE_VERSION,
    workspaces: localData?.workspaces || { default: workspaces.default },
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
    draft.currentWorkspace =
      !workspace && localData?.currentWorkspace
        ? localData.currentWorkspace
        : workspace || 'default';

    const workspacePreferences = lodashMerge(
      {},
      getPreferencesByWorkspace(draft.currentWorkspace),
      resProps,
    );
    const activeWorkspace = getActiveWorkspace(draft);

    /**
     * Update the local storage general preferences
     * 1- if local storage is empty.
     * 2- if predefine workspaces.
     * 3- a) if the local setting version != current settings version number
     *    b) if workspace not exists in the local storage
     *    c) if the local setting workspace version != current workspace version number
     *    d) if hard code workspace parameters !=  current workspace parameters
     */

    if (
      (workspaces[draft.currentWorkspace] &&
        (LOCAL_STORAGE_VERSION !== draft.version ||
          !activeWorkspace ||
          workspacePreferences?.version !== activeWorkspace?.version ||
          !checkKeysExists(
            workspacePreferences.display,
            activeWorkspace?.display,
          ))) ||
      !localData
    ) {
      const { workspaces, version } = original(draft) || {};
      const display = filterObject(workspacePreferences.display);

      const data = {
        version,
        workspaces: {
          ...workspaces,
          [draft.currentWorkspace]: {
            ...workspacePreferences,
            display,
          },
        },
      };
      draft.workspaces[draft.currentWorkspace] = lodashMerge(
        {},
        activeWorkspace,
        workspacePreferences,
      );
      storeData('nmr-general-settings', JSON.stringify(data));
    } else {
      activeWorkspace.display = lodashMerge(
        {},
        workspacePreferences.display,
        activeWorkspace.display,
      );
    }

    draft.dispatch = dispatch;
  }
}

function handleSetPreferences(draft: Draft<PreferencesState>, action) {
  if (action.payload) {
    const workspace = getActiveWorkspace(draft);

    const { controllers, formatting, display } = action.payload;

    let localData = getLocalStorage('nmr-general-settings');
    localData.currentWorkspace = draft.currentWorkspace;
    localData.workspaces = {
      ...localData.workspaces,
      [draft.currentWorkspace]: {
        ...localData.workspaces[draft.currentWorkspace],
        controllers,
        formatting,
        display,
      },
    };

    storeData('nmr-general-settings', JSON.stringify(localData));

    workspace.controllers = controllers;
    workspace.formatting = formatting;
    workspace.display = {
      ...workspace.display,
      panels: display.panels,
      general: {
        ...(workspace.display.general || {}),
        experimentalFeatures: display.general.experimentalFeatures,
      },
    };
    mapNucleus(draft);
  }
}
function handleSetPanelsPreferences(draft: Draft<PreferencesState>, action) {
  if (action.payload) {
    const workspace = getActiveWorkspace(draft);

    const { key, value } = action.payload;
    let localData = getLocalStorage('nmr-general-settings');
    localData.workspaces[draft.currentWorkspace].formatting.panels[key] = value;
    storeData('nmr-general-settings', JSON.stringify(localData));
    workspace.formatting.panels[key] = value;
  }
}
function handleResetPreferences(draft: Draft<PreferencesState>) {
  const workspace = getActiveWorkspace(draft);
  let localData = getLocalStorage('nmr-general-settings');

  const workSpaceDisplayPreferences = getPreferencesByWorkspace(
    draft.currentWorkspace,
  ).display;
  localData.workspaces[draft.currentWorkspace].display =
    workSpaceDisplayPreferences;
  workspace.display = workSpaceDisplayPreferences;
  storeData('nmr-general-settings', JSON.stringify(localData));
}
function handleSetWorkspace(
  draft: Draft<PreferencesState>,
  action: WorkspaceAction,
) {
  const workspaceKey = action.payload.workspace;
  if (!draft.workspaces[workspaceKey]) {
    draft.workspaces[workspaceKey] = getPreferencesByWorkspace(
      workspaceKey as NMRIumWorkspace,
    );
  }

  draft.currentWorkspace = workspaceKey as NMRIumWorkspace;
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
  draft.currentWorkspace = newWorkspaceKey as any;
}
function handleRemoveWorkspace(
  draft: Draft<PreferencesState>,
  action: WorkspaceAction,
) {
  const { workspace } = action.payload;

  if (workspace === draft.currentWorkspace) {
    draft.currentWorkspace = 'default';
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
