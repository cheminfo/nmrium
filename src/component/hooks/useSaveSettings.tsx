import { Button, Dialog, DialogBody, DialogFooter } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { revalidateLogic } from '@tanstack/react-form';
import type { Workspace } from '@zakodium/nmrium-core';
import { useRef } from 'react';
import { useForm as useReactScienceForm, useOnOff } from 'react-science/ui';
import { z } from 'zod/v4';

import { usePreferences } from '../context/PreferencesContext.js';
import { useToaster } from '../context/ToasterContext.js';

import { useWorkspaceAction } from './useWorkspaceAction.js';

const schema = z.object({
  workspaceName: z
    .string()
    .min(1, { error: 'Workspace name is 1 char length minimum' }),
});

export function useSaveSettings() {
  const toaster = useToaster();
  const [isOpenDialog, openDialog, closeDialog] = useOnOff(false);
  const settingsRef = useRef<Workspace>();
  const { current } = usePreferences();

  const { saveWorkspace, addNewWorkspace } = useWorkspaceAction();

  const form = useReactScienceForm({
    defaultValues: { workspaceName: '' },
    validationLogic: revalidateLogic({ modeAfterSubmission: 'change' }),
    validators: { onDynamic: schema },
    onSubmit: ({ value }) => {
      const { workspaceName } = value;
      addNewWorkspace(workspaceName, settingsRef.current);
      closeDialog();

      toaster.show({
        message: 'Preferences saved successfully',
        intent: 'success',
      });
    },
  });

  function saveSettings(values?: Partial<Workspace>) {
    settingsRef.current = values as Workspace;
    if (current.source !== 'user') {
      form.reset();
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
                    helpText="Please enter a new user workspace name in order to save your changes locally"
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
