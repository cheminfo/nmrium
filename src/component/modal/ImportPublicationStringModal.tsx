/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback, useRef } from 'react';
import * as yup from 'yup';

import { useDispatch } from '../context/DispatchContext';
import CloseButton from '../elements/CloseButton';
import FormikForm from '../elements/formik/FormikForm';
import FormikTextarea from '../elements/formik/FormikTextarea';
import { useAlert } from '../elements/popup/Alert';
import { GENERATE_SPECTRUM_FROM_PUBLICATION_STRING } from '../reducer/types/Types';

import { ModalStyles } from './ModalStyle';

const styles = css`
  width: 600px;
  height: 300px;

  .inner-content {
    flex: 1;
    border: none;
    overflow: hidden;
    padding: 0px;
  }

  .text-area {
    width: 100%;
    height: 100%;
    outline: none;
    resize: none;
    padding: 0 0 0 15px;
  }
`;

const validationSchema = yup.object({
  publicationText: yup.string().required(),
});

interface ImportPublicationStringModalProps {
  onClose: () => void;
}

function ImportPublicationStringModal({
  onClose,
}: ImportPublicationStringModalProps) {
  const formRef = useRef<any>();
  const dispatch = useDispatch();
  const alert = useAlert();
  const publicationStringHandler = useCallback(
    (values) => {
      void (async () => {
        const hideLoading = await alert.showLoading(
          'Generate spectrum from publication string in progress',
        );
        setTimeout(() => {
          dispatch({
            type: GENERATE_SPECTRUM_FROM_PUBLICATION_STRING,
            payload: values,
          });
          hideLoading();
        });
        onClose();
      })();
    },
    [alert, dispatch, onClose],
  );

  return (
    <div css={[ModalStyles, styles]}>
      <div className="header handle">
        <span>Import from publication string</span>
        <CloseButton onClick={onClose} className="close-bt" />
      </div>
      <div className="inner-content">
        <FormikForm
          ref={formRef}
          initialValues={{
            publicationText:
              '1H NMR (CDCl3, 400MHz) δ 10.58 (b, 1H), 7.40 (d, 1H, J = 8.0 Hz), 6.19 (d, 1H, J = 7.6 Hz), 4.88 (s, 1H), 2.17 (s, 3H), 1.02 (s, 9H), 1.01 (s, 9H), 0.89 (s, 9H)',
          }}
          validationSchema={validationSchema}
          onSubmit={publicationStringHandler}
        >
          <FormikTextarea
            name="publicationText"
            className="text-area"
            placeholder="Enter publication string"
          />
        </FormikForm>
      </div>
      <div className="footer-container">
        <button
          type="button"
          onClick={() => formRef.current.submitForm()}
          className="btn primary"
        >
          Import
        </button>
      </div>
    </div>
  );
}

export default ImportPublicationStringModal;
