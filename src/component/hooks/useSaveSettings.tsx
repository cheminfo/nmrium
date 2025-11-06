import { Button, Dialog, DialogBody, DialogFooter } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { revalidateLogic } from '@tanstack/react-form';
import type { Workspace } from '@zakodium/nmrium-core';
import { useRef } from 'react';
import { useForm as useReactScienceForm, useOnOff } from 'react-science/ui';
import { z } from 'zod/v4';

import { usePreferences } from '../context/PreferencesContext.js';
import { useToaster } from '../context/ToasterContext.js';
import { Input2Controller } from '../elements/Input2Controller.js';

import { useWorkspaceAction } from './useWorkspaceAction.js';

const schema = z.object({
  workspaceName: z.string({ error: 'Workspace name is required' }),
});

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
          if (event.key === 'Enter') {
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

  const { saveWorkspace, addNewWorkspace } = useWorkspaceAction();
  function handleAddNewWorkspace({ workspaceName }: { workspaceName: string }) {
    addNewWorkspace(workspaceName, settingsRef.current);

    closeDialog();
    toaster.show({
      message: 'Preferences saved successfully',
      intent: 'success',
    });
  }

  const form = useReactScienceForm({
    defaultValues: { workspaceName: '' },
    validationLogic: revalidateLogic({ modeAfterSubmission: 'change' }),
    validators: { onDynamic: schema },
    onSubmit: ({ value }) => {
      console.log(value.workspaceName);
    },
  });

  function saveSettings(values?: Partial<Workspace>) {
    settingsRef.current = values as Workspace;
    if (current.source !== 'user') {
      // reset({ workspaceName: '' });
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
          style={{ width: '60%' }}
          onClose={closeDialog}
          isOpen={isOpenDialog}
          title="Save workspace"
          role="dialog"
        >
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              void form.handleSubmit();
            }}
          >
            <DialogContent>
              <form.AppField name="workspaceName">
                {(field) => (
                  <field.Input
                    layout="inline"
                    label="New Workspace name"
                    placeholder="Enter workspace name"
                    required
                  />
                )}
              </form.AppField>
            </DialogContent>

            <DialogFooter>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row-reverse',
                  margin: 0,
                }}
              >
                <div style={{ marginLeft: 10 }}>
                  <form.AppForm>
                    <form.SubmitButton>Save workspace</form.SubmitButton>
                  </form.AppForm>
                </div>

                <Button
                  variant="outlined"
                  intent="danger"
                  onClick={closeDialog}
                >
                  Cancel
                </Button>
              </div>
            </DialogFooter>
          </form>
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
