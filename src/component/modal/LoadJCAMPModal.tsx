/** @jsxImportSource @emotion/react */
import { Formik, FormikProps } from 'formik';
import { readFromWebSource } from 'nmr-load-save';
import { useRef } from 'react';
import { Modal } from 'react-science/ui';
import * as Yup from 'yup';

import { useDispatch } from '../context/DispatchContext';
import Button from '../elements/Button';
import Label, { LabelStyle } from '../elements/Label';
import FormikError from '../elements/formik/FormikError';
import FormikInput from '../elements/formik/FormikInput';
import { useAlert } from '../elements/popup/Alert/Context';

const allowedExtensions = new Set(['dx', 'jdx', 'jcamp']);

const loadFormValidation = Yup.object({
  url: Yup.string()
    .url()
    .required()
    .test(
      'file type',
      'Imported file must be one of those extensions [ .jdx, .dx, .jcamp ]',
      (url) => {
        try {
          const fileURL = new URL(url);
          const extension = fileURL.pathname.split('.')?.[1] || '';
          if (allowedExtensions.has(extension)) {
            return true;
          }
        } catch {
          return false;
        }
        return false;
      },
    ),
});

const labelStyle: LabelStyle = {
  wrapper: { display: 'flex', height: '100%', flex: 1 },
};

interface LoadJCAMPModalProps {
  onCloseDialog: () => void;
  isOpen: boolean;
}
export function LoadJCAMPModal({ onCloseDialog, isOpen }: LoadJCAMPModalProps) {
  const dispatch = useDispatch();
  const alert = useAlert();
  const ref = useRef<FormikProps<any>>(null);

  if (!isOpen) return;

  async function loadJCAMPHandler({ url }) {
    const hidLoading = await alert.showLoading(
      'Load JCAMP from external URL in progress ...',
    );
    const { pathname, origin } = new URL(url);
    try {
      const nmriumState = await readFromWebSource({
        entries: [{ relativePath: pathname, baseURL: origin }],
      });

      dispatch({
        type: 'LOAD_DROP_FILES',
        payload: { nmriumState, resetSourceObject: false },
      });
    } catch {
      alert.error(`Failed to load ${url}`);
    } finally {
      hidLoading();
      onCloseDialog?.();
    }
  }

  return (
    <Modal hasCloseButton isOpen onRequestClose={onCloseDialog}>
      <Modal.Header>Load JCAMP Dialog</Modal.Header>
      <Modal.Body>
        <div style={{ minWidth: '400px', padding: '1.5em' }}>
          <Formik
            initialValues={{ url: '' }}
            validationSchema={loadFormValidation}
            onSubmit={loadJCAMPHandler}
            innerRef={ref}
          >
            <Label title="URL" style={labelStyle}>
              <FormikError name="url" style={{ container: { flex: 1 } }}>
                <FormikInput
                  name="url"
                  type="string"
                  style={{
                    input: {
                      padding: '0.8em',
                      textAlign: 'left',
                      width: '100%',
                    },
                    inputWrapper: { width: '100%' },
                  }}
                  placeholder="Enter URL to JCAMP-DX file"
                />
              </FormikError>
            </Label>
          </Formik>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
          <Button.Done onClick={() => ref.current?.submitForm()}>
            Load
          </Button.Done>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
