import { Button, Dialog, DialogBody, DialogFooter } from '@blueprintjs/core';
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
          style={{ width: 500 }}
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
            <DialogBody>
              <form.AppField name="workspaceName">
                {(field) => (
                  <field.Input
                    layout="inline"
                    autoFocus
                    label="New Workspace name"
                    placeholder="Enter workspace name"
                    helpText="Please enter a new user workspace name in order to save your changes locally"
                    required
                  />
                )}
              </form.AppField>
            </DialogBody>

            <DialogFooter
              actions={
                <>
                  <form.AppForm>
                    <form.SubmitButton intent="success">
                      Save workspace
                    </form.SubmitButton>
                  </form.AppForm>
                  <Button intent="danger" variant="outlined">
                    Cancel
                  </Button>
                </>
              }
            />
          </form>
        </Dialog>
      );
    },
  };
}
