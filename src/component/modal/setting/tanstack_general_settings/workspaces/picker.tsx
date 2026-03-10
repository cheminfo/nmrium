import { useMemo } from 'react';

import type { ExtendedWorkspace } from '../../../../context/PreferencesContext.tsx';
import {
  usePreferences,
  useWorkspacesList,
} from '../../../../context/PreferencesContext.tsx';
import Label from '../../../../elements/Label.tsx';
import type { DropDownListItem } from '../../../../elements/dropDownButton/DropDownButton.tsx';
import DropDownButton from '../../../../elements/dropDownButton/DropDownButton.tsx';
import { useWorkspaceAction } from '../../../../hooks/useWorkspaceAction.ts';
import { workspaceDefaultProperties } from '../../../../workspaces/workspaceDefaultProperties.ts';
import WorkspaceItem from '../../WorkspaceItem.tsx';
import {
  formValueToWorkspace,
  unsafeWorkspaceToForm,
} from '../hooks/use_safe_workspace.ts';

import type { WorkspacesProps } from './props.ts';

export function WorkspacePicker(props: WorkspacesProps) {
  const dropdownProps = useDropdownProps(props);
  const data = useWorkspaces();

  return (
    <Label title="Workspace">
      <DropDownButton<ExtendedWorkspace> {...dropdownProps} data={data} />
    </Label>
  );
}

function useWorkspaces() {
  const baseWorkspaces = useWorkspacesList();

  return useMemo<ExtendedWorkspace[]>(
    () => [
      ...baseWorkspaces,
      {
        key: 'new',
        label: 'Custom workspace',
        source: 'custom',
        visible: true,
        ...workspaceDefaultProperties,
      },
    ],
    [baseWorkspaces],
  );
}

function useDropdownProps(props: WorkspacesProps) {
  const { formValues, reset } = props;
  const { workspaces, current, workspace } = usePreferences();

  function handleChangeWorkspace(option: DropDownListItem) {
    setActiveWorkspace(option.key);
    reset(unsafeWorkspaceToForm(workspaces[option.key]));
  }

  const { addNewWorkspace, removeWorkspace, setActiveWorkspace } =
    useWorkspaceAction();

  function handleDeleteWorkspace(key: string) {
    const isActiveWorkspace = removeWorkspace(key);

    if (!isActiveWorkspace) {
      return;
    }

    reset(unsafeWorkspaceToForm(workspaces.default));
  }

  function handleAddWorkspace(name: string) {
    addNewWorkspace(name, formValueToWorkspace(formValues, current));
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

  return {
    renderItem,
    selectedKey: workspace.current,
    onSelect: handleChangeWorkspace,
  };
}
