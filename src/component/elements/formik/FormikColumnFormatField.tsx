import { useFormikContext } from 'formik';
import lodashGet from 'lodash/get';
import { CSSProperties, memo, useCallback } from 'react';

import Input from '../Input';

const styles: Record<'row' | 'inputLabel' | 'input', CSSProperties> = {
  row: {
    display: 'flex',
    margin: '5px 0px',
    alignItems: 'center',
  },
  inputLabel: {
    flex: 2,
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#232323',
  },
  input: {
    width: '60%',
    textAlign: 'center',
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
      setFieldValue(e.target.name, e.target.checked);
    },
    [setFieldValue],
  );

  return (
    <div style={styles.row}>
      <span style={styles.inputLabel}>{label}</span>
      <div
        style={{
          flex: 4,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        {!hideCheckField && (
          <input
            type="checkbox"
            style={{ margin: '0px 5px' }}
            name={checkControllerName}
            onChange={checkChangeHandler}
            checked={lodashGet(values, checkControllerName || '', false)}
          />
        )}
        {!hideFormatField && (
          <Input
            style={{ inputWrapper: styles.input }}
            name={formatControllerName}
            value={lodashGet(values, formatControllerName || '', '')}
            onChange={changeHandler}
            type="text"
            disabled={disableFormat}
          />
        )}
      </div>
    </div>
  );
}

export default memo(FormikColumnFormatField);
