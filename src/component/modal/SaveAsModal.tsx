/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback, useRef } from 'react';

import CloseButton from '../elements/CloseButton';
import FormikCheckBox from '../elements/formik/FormikCheckBox';
import FormikForm from '../elements/formik/FormikForm';
import FormikInput from '../elements/formik/FormikInput';

import { ModalStyles } from './ModalStyle';

const styles = css`
  .row {
    align-items: center;
  }

  .inner-content {
    flex: 1;
  }

  .custom-label {
    width: 80px;
  }

  .name {
    width: 100% !important;
    text-align: left !important;
  }
`;

const INITIAL_VALUE = {
  name: '',
  compressed: false,
  pretty: false,
  includeData: true,
};

interface SaveAsModalProps {
  onClose: (element?: any) => void;
  onSave: (element: any) => void;
  name: string;
}

function SaveAsModal({ onClose, onSave, name }: SaveAsModalProps) {
  const refForm = useRef<any>();

  const handleSave = useCallback(() => {
    refForm.current.submitForm();
  }, []);

  const submitHandler = useCallback(
    (values) => {
      onSave(values);
      onClose();
    },
    [onClose, onSave],
  );

  return (
    <div css={[ModalStyles, styles]}>
      <div className="header handle">
        <span>Save as ... </span>
        <CloseButton onClick={onClose} className="close-bt" />
      </div>
      <div className="inner-content">
        <FormikForm
          ref={refForm}
          initialValues={{ ...INITIAL_VALUE, name }}
          onSubmit={submitHandler}
        >
          <div className="row margin-10">
            <span className="custom-label">Name</span>
            <FormikInput
              label=""
              name="name"
              className="name"
              style={{
                container: { width: '100%' },
              }}
            />
          </div>

          <div className="row margin-10">
            <span className="custom-label">Compressed</span>
            <FormikCheckBox name="compressed" />
          </div>
          <div className="row margin-10">
            <span className="custom-label">Pretty Format</span>
            <FormikCheckBox name="pretty" />
          </div>
          <div className="row margin-10">
            <span className="custom-label">Include Data</span>
            <FormikCheckBox name="includeData" />
          </div>
        </FormikForm>
      </div>
      <div className="footer-container">
        <button type="button" onClick={handleSave} className="btn primary">
          Save
        </button>
        <button type="button" onClick={onClose} className="btn">
          Close
        </button>
      </div>
    </div>
  );
}

export default SaveAsModal;
