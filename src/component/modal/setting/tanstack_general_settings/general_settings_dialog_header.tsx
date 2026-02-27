import { Classes } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { useStore } from '@tanstack/react-form';
import { useMemo } from 'react';
import { withForm } from 'react-science/ui';

import type { ExtendedWorkspace } from '../../../context/PreferencesContext.js';
import {
  usePreferences,
  useWorkspacesList,
} from '../../../context/PreferencesContext.js';
import Label from '../../../elements/Label.js';
import type { DropDownListItem } from '../../../elements/dropDownButton/DropDownButton.js';
import DropDownButton from '../../../elements/dropDownButton/DropDownButton.js';
import { useWorkspaceAction } from '../../../hooks/useWorkspaceAction.js';
import { workspaceDefaultProperties } from '../../../workspaces/workspaceDefaultProperties.ts';
import WorkspaceItem from '../WorkspaceItem.js';

import { GeneralSettingsDialogHeaderActionsButtons } from './general_settings_dialog_header_actions_buttons.js';
import {
  formValueToWorkspace,
  unsafeWorkspaceToForm,
} from './hooks/use_safe_workspace.ts';
import { defaultGeneralSettingsFormValues } from './validation.ts';

export const GeneralSettingsDialogHeader = withForm({
  defaultValues: defaultGeneralSettingsFormValues,
  render: function GeneralSettingsDialogHeader({ form }) {
    const { reset } = form;

    const baseWorkspaces = useWorkspacesList();
    const { workspaces, ...preferences } = usePreferences();

    const { addNewWorkspace, removeWorkspace, setActiveWorkspace } =
      useWorkspaceAction();

    const workspacesList = useMemo(() => {
      return baseWorkspaces.concat([
        {
          key: 'new',
          label: 'Custom workspace',
          source: 'custom',
          visible: true,
          ...workspaceDefaultProperties,
        },
      ]);
    }, [baseWorkspaces]);

    const currentValues = useStore(form.store, (state) => state.values);

    function handleChangeWorkspace(option: DropDownListItem) {
      setActiveWorkspace(option.key);
      reset(unsafeWorkspaceToForm(workspaces[option.key]));
    }

    function handleDeleteWorkspace(key: string) {
      const isActiveWorkspace = removeWorkspace(key);

      if (!isActiveWorkspace) {
        return;
      }

      reset(unsafeWorkspaceToForm(workspaces.default));
    }

    function handleAddWorkspace(name: string) {
      addNewWorkspace(
        name,
        formValueToWorkspace(currentValues, preferences.current),
      );
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

        <GeneralSettingsDialogHeaderActionsButtons form={form} />
      </DialogHeader>
    );
  },
});

const DialogHeader = styled.div`
  cursor: default;
  padding-top: 10px;
  box-shadow: none;
  background-color: #f8f8f8;
`;
