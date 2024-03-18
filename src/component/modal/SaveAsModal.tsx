/** @jsxImportSource @emotion/react */
import { Dialog, DialogBody, DialogFooter } from '@blueprintjs/core';
import { css } from '@emotion/react';
import { Field, Formik } from 'formik';
import { useRef } from 'react';

import { DataExportOptions } from '../../data/SpectraManager';
import { useChartData } from '../context/ChartContext';
import ActionButtons from '../elements/ActionButtons';
import Label, { LabelStyle } from '../elements/Label';
import FormikCheckBox from '../elements/formik/FormikCheckBox';
import FormikInput from '../elements/formik/FormikInput';
import useExport from '../hooks/useExport';

const styles = css`
  display: flex;
  flex-direction: column;

  label {
    margin-right: 20px;
    display: inline-block;
  }

  input[type='radio'] {
    margin-right: 5px;
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
  onCloseDialog: () => void;
  isOpen: boolean;
}

function SaveAsModal(props: SaveAsModalProps) {
  const { onCloseDialog, isOpen } = props;
  const refForm = useRef<any>();
  const { source, data } = useChartData();
  const { saveHandler } = useExport();

  const fileName = data[0]?.info?.name;

  function submitHandler(values) {
    saveHandler(values);
    onCloseDialog?.();
  }

  if (!isOpen) return;

  return (
    <Dialog
      isOpen
      title="Save as ... "
      onClose={onCloseDialog}
      style={{ width: 500 }}
    >
      <DialogBody
        css={css`
          background-color: white;
        `}
      >
        <Formik
          innerRef={refForm}
          initialValues={{ ...INITIAL_VALUE, name: fileName }}
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
            <Label style={labelStyle} title="Pretty format">
              <FormikCheckBox name="pretty" />
            </Label>
            <Label style={labelStyle} title="Include view">
              <FormikCheckBox name="include.view" />
            </Label>
            <Label style={labelStyle} title="Include settings">
              <FormikCheckBox name="include.settings" />
            </Label>
            <Label style={labelStyle} title="Include data">
              <div css={styles}>
                <div>
                  <label>
                    <Field
                      type="radio"
                      name="include.dataType"
                      value={DataExportOptions.ROW_DATA}
                    />
                    Raw data
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
                    Data source
                  </label>
                  <label>
                    <Field
                      type="radio"
                      name="include.dataType"
                      value={DataExportOptions.NO_DATA}
                    />
                    No data
                  </label>
                </div>
              </div>
            </Label>
          </>
        </Formik>
      </DialogBody>
      <DialogFooter>
        <ActionButtons
          style={{ flexDirection: 'row-reverse', margin: 0 }}
          onDone={() => refForm.current.submitForm()}
          doneLabel="Save"
          onCancel={() => onCloseDialog?.()}
        />
      </DialogFooter>
    </Dialog>
  );
}

export default SaveAsModal;
