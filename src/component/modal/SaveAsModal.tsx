/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Field, Formik } from 'formik';
import { useCallback, useRef } from 'react';

import { DataExportOptions } from '../../data/SpectraManager';
import { useChartData } from '../context/ChartContext';
import ActionButtons from '../elements/ActionButtons';
import CloseButton from '../elements/CloseButton';
import Label, { LabelStyle } from '../elements/Label';
import FormikCheckBox from '../elements/formik/FormikCheckBox';
import FormikInput from '../elements/formik/FormikInput';

import { ModalStyles } from './ModalStyle';

const styles = css`
  .inner-content {
    flex: 1;
  }

  .data-export-group {
    label {
      margin-right: 10px;
      display: inline-block;
    }

    input[type='radio'] {
      margin-right: 5px;
    }
  }
`;

const INITIAL_VALUE = {
  name: '',
  compressed: false,
  pretty: false,
  include: {
    dataType: DataExportOptions.ROW_DATA,
    view: false,
    settings: false,
  },
};

export const labelStyle: LabelStyle = {
  label: {
    flex: 4,
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#232323',
  },
  wrapper: {
    flex: 8,
    display: 'flex',
    justifyContent: 'flex-start',
  },
  container: { padding: '5px 0' },
};

interface SaveAsModalProps {
  onClose?: (event?: MouseEvent) => void;
  onSave: (element: any) => void;
  name: string;
}

function SaveAsModal({ onClose, onSave, name }: SaveAsModalProps) {
  const refForm = useRef<any>();
  const { source } = useChartData();

  const handleSave = useCallback(() => {
    refForm.current.submitForm();
  }, []);

  const submitHandler = useCallback(
    (values) => {
      onSave(values);
      onClose?.();
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
        <Formik
          innerRef={refForm}
          initialValues={{ ...INITIAL_VALUE, name }}
          onSubmit={submitHandler}
        >
          <>
            <Label style={labelStyle} title="Name">
              <FormikInput
                name="name"
                className="name"
                style={{
                  inputWrapper: { width: '100%' },
                  input: { padding: '5px', textAlign: 'left' },
                }}
              />
            </Label>
            <Label style={labelStyle} title="Compressed">
              <FormikCheckBox name="compressed" />
            </Label>
            <Label style={labelStyle} title="Pretty Format">
              <FormikCheckBox name="pretty" />
            </Label>
            <Label style={labelStyle} title="Include view">
              <FormikCheckBox name="include.view" />
            </Label>
            <Label style={labelStyle} title="Include settings">
              <FormikCheckBox name="include.settings" />
            </Label>
            <Label style={labelStyle} title="Include Data">
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="data-export-group">
                  <label>
                    <Field
                      type="radio"
                      name="include.dataType"
                      value={DataExportOptions.ROW_DATA}
                    />
                    Raw Data
                  </label>
                  <label
                    style={{
                      color: source ? 'black' : 'lightgray',
                    }}
                  >
                    <Field
                      type="radio"
                      name="include.dataType"
                      value={DataExportOptions.DATA_SOURCE}
                      disabled={!source}
                    />
                    Data Source
                  </label>
                  <label>
                    <Field
                      type="radio"
                      name="include.dataType"
                      value={DataExportOptions.NO_DATA}
                    />
                    No Data
                  </label>
                </div>
              </div>
            </Label>
          </>
        </Formik>
      </div>
      <div className="footer-container">
        <ActionButtons
          style={{ flexDirection: 'row-reverse', margin: 0 }}
          onDone={handleSave}
          doneLabel="Save"
          onCancel={() => onClose?.()}
        />
      </div>
    </div>
  );
}

export default SaveAsModal;
