import { Classes } from '@blueprintjs/core';
import styled from '@emotion/styled';
import type { Workspace } from '@zakodium/nmrium-core';
import { useMemo } from 'react';

import type { ExtendedWorkspace } from '../../../context/PreferencesContext.js';
import {
  usePreferences,
  useWorkspacesList,
} from '../../../context/PreferencesContext.js';
import Label from '../../../elements/Label.js';
import type { DropDownListItem } from '../../../elements/dropDownButton/DropDownButton.js';
import DropDownButton from '../../../elements/dropDownButton/DropDownButton.js';
import { useWorkspaceAction } from '../../../hooks/useWorkspaceAction.js';
import WorkspaceItem from '../WorkspaceItem.js';

import { GeneralSettingsDialogHeaderActionsButtons } from './general_settings_dialog_header_actions_buttons.js';

interface GeneralSettingsDialogHeaderProps<T extends object> {
  reset: (values?: T) => void;
  currentValues: T;
}

export function GeneralSettingsDialogHeader<T extends object>(
  props: GeneralSettingsDialogHeaderProps<T>,
) {
  const { reset, currentValues } = props;

  const baseWorkspaces = useWorkspacesList();
  const { workspaces, ...preferences } = usePreferences();

  const { addNewWorkspace, removeWorkspace, setActiveWorkspace } =
    useWorkspaceAction();

  const workspacesList = useMemo(() => {
    return baseWorkspaces.concat([
      {
        key: 'new',
        label: 'Custom workspace',
      } as any,
    ]);
  }, [baseWorkspaces]);

  function handleChangeWorkspace(option: DropDownListItem) {
    setActiveWorkspace(option.key);
    reset(workspaces[option.key] as T);
  }

  function handleDeleteWorkspace(key: string) {
    const isActiveWorkspace = removeWorkspace(key);

    if (!isActiveWorkspace) {
      return;
    }

    reset(workspaces.default as T);
  }

  function handleAddWorkspace(name: string) {
    // TODO: change the as when the full form is done.
    addNewWorkspace(name, currentValues as Workspace);
  }

  function renderItem(item: DropDownListItem) {
    return (
      <WorkspaceItem
        item={item}
        onSave={handleAddWorkspace}
        onDelete={handleDeleteWorkspace}
      />
    );
  }

  return (
    <DialogHeader className={Classes.DIALOG_HEADER}>
      <Label title="Workspace">
        <DropDownButton<ExtendedWorkspace>
          data={workspacesList}
          renderItem={renderItem}
          selectedKey={preferences.workspace.current}
          onSelect={handleChangeWorkspace}
        />
      </Label>

      <GeneralSettingsDialogHeaderActionsButtons<T>
        reset={reset}
        values={currentValues}
      />
    </DialogHeader>
  );
}

const DialogHeader = styled.div`
  cursor: default;
  padding-top: 10px;
  box-shadow: none;
  background-color: #f8f8f8;
`;
