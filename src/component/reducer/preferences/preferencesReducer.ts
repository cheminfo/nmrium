import { Draft, produce } from 'immer';

import { NMRiumWorkspace, NMRiumPreferences } from '../../NMRium';
import { getLocalStorage, removeData } from '../../utility/LocalStorage';
import Workspaces from '../../workspaces';
import { Workspace } from '../../workspaces/Workspace';
import { ActionType } from '../types/Types';

import { addWorkspace } from './actions/addWorkspace';
import { initPreferences } from './actions/initPreferences';
import { removeWorkspace } from './actions/removeWorkspace';
import { resetPreferences } from './actions/resetPreferences';
import { setPanelsPreferences } from './actions/setPanelsPreferences';
import { setPreferences } from './actions/setPreferences';
import { setWorkspace } from './actions/setWorkspace';

const LOCAL_STORAGE_VERSION = 9;

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

export type WorkspaceAction = ActionType<
  'SET_WORKSPACE' | 'REMOVE_WORKSPACE',
  { workspace: string }
>;
export type AddWorkspaceAction = ActionType<
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
    key: 'embedded',
    label: Workspaces.embedded.label,
  },
];

export interface PreferencesState {
  version: number;
  workspaces: Record<string, Workspace>;
  dispatch: (action?: PreferencesActions) => void;
  workspace: {
    current: NMRiumWorkspace;
    base: NMRiumWorkspace | null;
  };
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
    case 'RESET_PREFERENCES':
      return resetPreferences(draft);
    case 'SET_WORKSPACE':
      return setWorkspace(draft, action);
    case 'ADD_WORKSPACE':
      return addWorkspace(draft, action);
    case 'REMOVE_WORKSPACE':
      return removeWorkspace(draft, action);
    default:
      return draft;
  }
}
const preferencesReducer = produce(innerPreferencesReducer);

export default preferencesReducer;
