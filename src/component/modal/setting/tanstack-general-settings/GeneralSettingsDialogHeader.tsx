import { Classes } from '@blueprintjs/core';
import { useMemo } from 'react';

import type { ExtendedWorkspace } from '../../../context/PreferencesContext.tsx';
import {
  usePreferences,
  useWorkspacesList,
} from '../../../context/PreferencesContext.tsx';
import Label from '../../../elements/Label.tsx';
import type { DropDownListItem } from '../../../elements/dropDownButton/DropDownButton.tsx';
import DropDownButton from '../../../elements/dropDownButton/DropDownButton.tsx';
import { useWorkspaceAction } from '../../../hooks/useWorkspaceAction.ts';
import WorkspaceItem from '../WorkspaceItem.tsx';

import { GeneralSettingsDialogHeaderActionsButtons } from './GeneralSettingsDialogHeaderActionsButtons.tsx';

interface GeneralSettingsDialogHeaderProps<T> {
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
    addNewWorkspace(name, currentValues as any);
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
    <div
      className={Classes.DIALOG_HEADER}
      style={{
        cursor: 'default',
        paddingTop: '10px',
        boxShadow: 'none',
        backgroundColor: '#f8f8f8',
      }}
    >
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
    </div>
  );
}
