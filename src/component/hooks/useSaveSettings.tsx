import { Formik, FormikProps } from 'formik';
import { useRef, forwardRef } from 'react';
import * as Yup from 'yup';

import { usePreferences } from '../context/PreferencesContext';
import FormikInput from '../elements/formik/FormikInput';
import { useAlert } from '../elements/popup/Alert/Context';
import { useModal } from '../elements/popup/Modal/Context';

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
          />
        </Formik>
      </div>
    );
  },
);

export function useSaveSettings() {
  const modal = useModal();
  const alert = useAlert();

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
    modal.close();
    alert.success('Preferences saved successfully');
  }

  return (values) => {
    const alertConfig = {
      message:
        'Please enter a new user workspace name in order to save your changes locally',
      render: (props) => (
        <WorkspaceAddForm
          {...props}
          onSave={({ workspaceName }) => addNewWorkspace(workspaceName, values)}
          ref={formRef}
        />
      ),
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            void formRef.current?.submitForm();
          },
          preventClose: true,
        },
        { text: 'No' },
      ],
    };

    if (current.source !== 'user') {
      modal.showConfirmDialog(alertConfig);
    } else {
      dispatch({
        type: 'SET_PREFERENCES',
        payload: values,
      });
      modal.close();
    }
  };
}
