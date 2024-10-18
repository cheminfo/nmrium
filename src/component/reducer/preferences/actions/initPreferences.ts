import type { Draft } from 'immer';

import type { NMRiumWorkspace } from '../../../main/index.js';
import type { PreferencesState } from '../preferencesReducer.js';
import { WORKSPACES_KEYS } from '../preferencesReducer.js';
import { initWorkspace } from '../utilities/initWorkspace.js';
import { mapWorkspaces } from '../utilities/mapWorkspaces.js';

function getWorkspace(
  draft: Draft<PreferencesState>,
  workspace: NMRiumWorkspace,
) {
  return draft.workspaces[workspace] ? workspace : 'default';
}

export function initPreferences(draft: Draft<PreferencesState>, action) {
  if (action.payload) {
    const {
      dispatch,
      workspace,
      customWorkspaces: cw,
      preferences,
      currentWorkspace,
    } = action.payload;
    const customWorkspaces = mapWorkspaces(cw, { source: 'custom' });

    draft.workspaces = {
      ...draft.workspaces,
      ...customWorkspaces,
    };
    draft.originalWorkspaces = {
      ...draft.originalWorkspaces,
      ...customWorkspaces,
    };

    /**
     *  we have the following priorities
        1- .nmrium file settings (systematic special name of workspace)
        2- preferences
        3- workspace -> if does not exists -> default workspace
        4- last selected workspace
     */

    if (preferences) {
      draft.workspace = {
        current: WORKSPACES_KEYS.componentKey,
        base: WORKSPACES_KEYS.componentKey,
      };
    } else if (workspace) {
      const _workspace = getWorkspace(draft, workspace);
      draft.workspace = {
        current: _workspace,
        base: _workspace,
      };
    } else {
      const _workspace = getWorkspace(draft, currentWorkspace);
      draft.workspace = { current: _workspace, base: null };
    }

    if (preferences) {
      const workspaceData = {
        label: 'NMRium Preferences',
        source: 'component',
      };
      draft.workspaces = {
        ...draft.workspaces,
        [WORKSPACES_KEYS.componentKey]: initWorkspace(
          preferences,
          workspaceData as any,
        ),
      };
      draft.originalWorkspaces = {
        ...draft.workspaces,
        [WORKSPACES_KEYS.componentKey]: initWorkspace(
          preferences,
          workspaceData as any,
        ),
      };
    }

    draft.dispatch = dispatch;
  }
}
