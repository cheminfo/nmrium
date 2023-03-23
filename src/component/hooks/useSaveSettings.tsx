import { Formik, FormikProps } from 'formik';
import { useRef, forwardRef, useState } from 'react';
import { Modal, useOnOff } from 'react-science/ui';
import * as Yup from 'yup';

import { usePreferences } from '../context/PreferencesContext';
import FormikInput from '../elements/formik/FormikInput';
import { useAlert } from '../elements/popup/Alert/Context';
import ConfirmationDialog from '../elements/popup/Modal/ConfirmDialog';
import { Workspace } from '../workspaces/Workspace';

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
                height: '35px',
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
  const alert = useAlert();
  const [isOpenDialog, openDialog, closeDialog] = useOnOff(false);
  const [values, setValues] = useState<Partial<Workspace> | undefined>(
    undefined,
  );
  const { dispatch, current } = usePreferences();
  const formRef = useRef<FormikProps<any>>(null);
  function addNewWorkspace(workspaceName, values) {
    dispatch({
      type: 'ADD_WORKSPACE',
      payload: {
        workspace: workspaceName,
        data: values,
      },
    });
    closeDialog();
    alert.success('Preferences saved successfully');
  }

  return {
    saveSettings: (values?: Partial<Workspace>) => {
      setValues(values);

      if (current.source !== 'user') {
        openDialog();
      } else {
        dispatch({
          type: 'SET_PREFERENCES',
          payload: values as any,
        });
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
            onSave={({ workspaceName }) =>
              addNewWorkspace(workspaceName, values)
            }
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
        <Modal
          hasCloseButton
          isOpen={isOpenDialog}
          onRequestClose={closeDialog}
        >
          <ConfirmationDialog {...alertConfig} />
        </Modal>
      );
    },
  };
}
