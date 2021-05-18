import { useFormikContext } from 'formik';
import lodashGet from 'lodash/get';
import { memo, useCallback } from 'react';

import Input from '../Input';

const styles = {
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

function FormikColumnFormatField({
  label,
  checkControllerName,
  formatControllerName,
}) {
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
        <input
          type="checkbox"
          style={{ margin: '0px 5px' }}
          name={checkControllerName}
          onChange={checkChangeHandler}
          checked={lodashGet(values, checkControllerName)}
        />
        <Input
          style={{ container: styles.input }}
          name={formatControllerName}
          value={lodashGet(values, formatControllerName)}
          onChange={changeHandler}
          type="text"
        />
      </div>
    </div>
  );
}

export default memo(FormikColumnFormatField);
