import { Dialog } from '@blueprintjs/core';
import { Formik, FormikProps } from 'formik';
import { Workspace } from 'nmr-load-save';
import { useRef, forwardRef } from 'react';
import { useOnOff } from 'react-science/ui';
import * as Yup from 'yup';

import { usePreferences } from '../context/PreferencesContext';
import { useToaster } from '../context/ToasterContext';
import FormikInput from '../elements/formik/FormikInput';
import ConfirmationDialog from '../elements/popup/Modal/ConfirmDialog';

import { useWorkspaceAction } from './useWorkspaceAction';

const schema = Yup.object().shape({
  workspaceName: Yup.string().required(),
});

const WorkspaceAddForm = forwardRef<FormikProps<any>, any>(
  ({ className, message, onSave }, ref) => {
    return (
      <div className={className}>
        <p style={{ paddingBottom: '10px' }}>{message}</p>
        <Formik
          initialValues={{ workspaceName: '' }}
          validationSchema={schema}
          onSubmit={onSave}
          innerRef={ref}
        >
          <FormikInput
            name="workspaceName"
            placeholder="Enter workspace Name"
            style={{
              input: {
                padding: '0.5em',
                width: '90%',
                fontWeight: 'normal',
                color: 'black',
              },
            }}
            autoFocus
          />
        </Formik>
      </div>
    );
  },
);

export function useSaveSettings() {
  const toaster = useToaster();
  const [isOpenDialog, openDialog, closeDialog] = useOnOff(false);
  const settingsRef = useRef<Workspace>();
  const { current } = usePreferences();
  const formRef = useRef<FormikProps<any>>(null);
  const { saveWorkspace, addNewWorkspace } = useWorkspaceAction();

  function handleAddNewWorkspace({ workspaceName }) {
    addNewWorkspace(workspaceName, settingsRef.current);

    closeDialog();
    toaster.show({
      message: 'Preferences saved successfully',
      intent: 'success',
    });
  }

  return {
    saveSettings: (values?: Partial<Workspace>) => {
      settingsRef.current = values as Workspace;
      if (current.source !== 'user') {
        openDialog();
      } else {
        saveWorkspace(values);

        closeDialog();
      }
    },
    SaveSettingsModal: () => {
      const alertConfig: any = {
        message:
          'Please enter a new user workspace name in order to save your changes locally',
        render: (props) => (
          <WorkspaceAddForm
            {...props}
            onSave={handleAddNewWorkspace}
            ref={formRef}
          />
        ),
        buttons: [
          {
            text: 'Save',
            handler: () => {
              void formRef.current?.submitForm();
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
