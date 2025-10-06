import { Dialog, DialogBody, DialogFooter } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { yupResolver } from '@hookform/resolvers/yup';
import type { Workspace } from '@zakodium/nmrium-core';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useOnOff } from 'react-science/ui';
import * as Yup from 'yup';

import { usePreferences } from '../context/PreferencesContext.js';
import { useToaster } from '../context/ToasterContext.js';
import ActionButtons from '../elements/ActionButtons.js';
import { Input2Controller } from '../elements/Input2Controller.js';

import { useWorkspaceAction } from './useWorkspaceAction.js';

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

function WorkspaceAddForm(props: any) {
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
        size="large"
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
      return (
        <Dialog
          onClose={closeDialog}
          isOpen={isOpenDialog}
          title="Save workspace"
          role="dialog"
        >
          <DialogContent>
            <Title>
              Please enter a new user workspace name in order to save your
              changes locally
            </Title>
            <WorkspaceAddForm
              onEnter={() => {
                void handleSubmit(handleAddNewWorkspace)();
              }}
              control={control}
            />
          </DialogContent>
          <DialogFooter>
            <ActionButtons
              style={{ flexDirection: 'row-reverse', margin: 0 }}
              onCancel={closeDialog}
              doneLabel="Save workspace"
              onDone={() => void handleSubmit(handleAddNewWorkspace)()}
            />
          </DialogFooter>
        </Dialog>
      );
    },
  };
}

const DialogContent = styled(DialogBody)`
  background-color: white;
  text-align: center;
`;

const Title = styled.p`
  font-size: 1em;
  font-weight: bold;
  padding: 0 30px;
  text-align: left;
`;
