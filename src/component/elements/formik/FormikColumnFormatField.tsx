import { useFormikContext } from 'formik';
import lodashGet from 'lodash/get';
import { memo, useCallback } from 'react';

import Input, { InputStyle } from '../Input';
import Label, { LabelStyle } from '../Label';

export const formatFieldInputStyle: InputStyle = {
  inputWrapper: {
    width: '60%',
    margin: '2px 0',
  },
  input: {
    padding: '2px',
    textAlign: 'center',
  },
};

export const formatFieldLabelStyle: LabelStyle = {
  label: {
    flex: 4,
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#232323',
  },
  wrapper: {
    flex: 8,
  },
};

export interface ColumnFormatField {
  label: string;
  checkControllerName?: string;
  formatControllerName?: string;
  disableFormat?: boolean;
  hideFormatField?: boolean;
  hideCheckField?: boolean;
}

function FormikColumnFormatField(props: ColumnFormatField) {
  const {
    label,
    checkControllerName,
    formatControllerName,
    disableFormat = false,
    hideFormatField = false,
    hideCheckField = false,
  } = props;

  const { values, handleChange, setFieldValue } = useFormikContext();

  const changeHandler = useCallback(
    (e) => {
      handleChange(e);
    },
    [handleChange],
  );

  const checkChangeHandler = useCallback(
    (e) => {
      void setFieldValue(e.target.name, e.target.checked);
    },
    [setFieldValue],
  );

  return (
    <Label title={label} style={formatFieldLabelStyle}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          ...(hideFormatField && { height: '25px' }),
        }}
      >
        {!hideCheckField && checkControllerName ? (
          <input
            type="checkbox"
            style={{ margin: '0px 5px' }}
            name={checkControllerName}
            onChange={checkChangeHandler}
            checked={lodashGet(values, checkControllerName, false)}
          />
        ) : (
          <div style={{ width: '23px' }} />
        )}
        {!hideFormatField && formatControllerName && (
          <Input
            style={formatFieldInputStyle}
            name={formatControllerName}
            value={lodashGet(values, formatControllerName, '')}
            onChange={changeHandler}
            type="text"
            disabled={disableFormat}
          />
        )}
      </div>
    </Label>
  );
}

export default memo(FormikColumnFormatField);
