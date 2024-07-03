import { Dialog } from '@blueprintjs/core';
import { yupResolver } from '@hookform/resolvers/yup';
import { Workspace } from 'nmr-load-save';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useOnOff } from 'react-science/ui';
import * as Yup from 'yup';

import { usePreferences } from '../context/PreferencesContext';
import { useToaster } from '../context/ToasterContext';
import { Input2Controller } from '../elements/Input2Controller';
import ConfirmationDialog from '../elements/popup/Modal/ConfirmDialog';

import { useWorkspaceAction } from './useWorkspaceAction';

const schema = Yup.object().shape({
  workspaceName: Yup.string().required(),
});

function keyDownCheck(event: React.KeyboardEvent<HTMLInputElement>) {
  if (event.key === 'Enter') {
    return true;
  } else if (event.key === 'Escape') {
    return false;
  }
}

function WorkspaceAddForm(props) {
  const { className, message, control, onEnter } = props;

  return (
    <div className={className}>
      <p style={{ paddingBottom: '10px' }}>{message}</p>
      <Input2Controller
        control={control}
        name="workspaceName"
        placeholder="Enter workspace Name"
        style={{
          width: '90%',
          borderRadius: '5px',
        }}
        autoFocus
        large
        onKeyDown={(event) => {
          if (keyDownCheck(event)) {
            onEnter();
          }
        }}
      />
    </div>
  );
}

export function useSaveSettings() {
  const toaster = useToaster();
  const [isOpenDialog, openDialog, closeDialog] = useOnOff(false);
  const settingsRef = useRef<Workspace>();
  const { current } = usePreferences();
  const { handleSubmit, control, reset } = useForm({
    defaultValues: { workspaceName: '' },
    resolver: yupResolver(schema),
  });
  const { saveWorkspace, addNewWorkspace } = useWorkspaceAction();

  function handleAddNewWorkspace({ workspaceName }) {
    addNewWorkspace(workspaceName, settingsRef.current);

    closeDialog();
    toaster.show({
      message: 'Preferences saved successfully',
      intent: 'success',
    });
  }

  function saveSettings(values?: Partial<Workspace>) {
    settingsRef.current = values as Workspace;
    if (current.source !== 'user') {
      reset({ workspaceName: '' });
      openDialog();
    } else {
      saveWorkspace(values);

      closeDialog();
    }
  }
  return {
    saveSettings,
    SaveSettingsModal: () => {
      const alertConfig: any = {
        message:
          'Please enter a new user workspace name in order to save your changes locally',
        render: (props) => (
          <WorkspaceAddForm
            {...props}
            onEnter={() => {
              void handleSubmit(handleAddNewWorkspace)();
            }}
            control={control}
          />
        ),
        buttons: [
          {
            text: 'Save',
            handler: () => {
              void handleSubmit(handleAddNewWorkspace)();
            },
            preventClose: true,
          },
          { text: 'Cancel' },
        ],
        id: 'save-workspace-dialog',
        onClose: closeDialog,
      };
      return (
        <Dialog
          onClose={closeDialog}
          isOpen={isOpenDialog}
          title="Save workspace"
        >
          <ConfirmationDialog disableDefaultStyle {...alertConfig} />
        </Dialog>
      );
    },
  };
}
