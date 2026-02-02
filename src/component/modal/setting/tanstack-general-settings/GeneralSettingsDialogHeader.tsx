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

interface GeneralSettingsDialogHeaderProps<T> {
  reset: (values?: T) => void;
}

export function GeneralSettingsDialogHeader<T>(
  props: GeneralSettingsDialogHeaderProps<T>,
) {
  const { reset } = props;

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

  function deleteWorkspace(key: string) {
    const isActiveWorkspace = removeWorkspace(key);

    if (!isActiveWorkspace) {
      return;
    }

    reset(workspaces.default as T);
  }

  function renderItem(item: DropDownListItem) {
    return (
      <WorkspaceItem item={item} onSave={() => {}} onDelete={deleteWorkspace} />
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
          onSelect={() => {}}
        />
      </Label>
    </div>
  );
}
