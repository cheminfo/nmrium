/** @jsxImportSource @emotion/react */
import { Dialog, DialogBody, DialogFooter } from '@blueprintjs/core';
import { css } from '@emotion/react';
import { Formik, FormikProps } from 'formik';
import { readFromWebSource } from 'nmr-load-save';
import { useRef } from 'react';
import * as Yup from 'yup';

import { useDispatch } from '../context/DispatchContext';
import { useToaster } from '../context/ToasterContext';
import Button from '../elements/Button';
import Label, { LabelStyle } from '../elements/Label';
import FormikError from '../elements/formik/FormikError';
import FormikInput from '../elements/formik/FormikInput';

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
  const toaster = useToaster();
  const ref = useRef<FormikProps<any>>(null);

  if (!isOpen) return;

  async function loadJCAMPHandler({ url }) {
    const hidLoading = toaster.showLoading({
      message: 'Load JCAMP from external URL in progress ...',
    });
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
      toaster.show({ message: `Failed to load ${url}`, intent: 'danger' });
    } finally {
      hidLoading();
      onCloseDialog?.();
    }
  }

  return (
    <Dialog
      isOpen
      onClose={onCloseDialog}
      title="Load JCAMP"
      style={{ minWidth: '400px' }}
    >
      <DialogBody
        css={css`
          background-color: white;
        `}
      >
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
      </DialogBody>
      <DialogFooter>
        <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
          <Button.Done onClick={() => ref.current?.submitForm()}>
            Load
          </Button.Done>
        </div>
      </DialogFooter>
    </Dialog>
  );
}
