import { useFormikContext } from 'formik';
import lodash from 'lodash';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect } from 'react';

import Input from '../Input';

const FormikInput = ({
  label,
  name,
  style,
  onChange,
  checkValue,
  type,
  className,
  value,
  format,
}) => {
  const { values, handleChange, setFieldValue } = useFormikContext();
  const changeHandler = useCallback(
    (e) => {
      onChange(e);
      handleChange(e);
    },
    [handleChange, onChange],
  );

  useEffect(() => {
    if (value) {
      setFieldValue(name, value);
    }
  }, [name, setFieldValue, value]);

  return (
    <Input
      label={label}
      name={name}
      value={value ? value : lodash.get(values, name)}
      onChange={changeHandler}
      type={type}
      style={style}
      checkValue={checkValue}
      className={className}
      format={format}
    />
  );
};

FormikInput.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string,
  // defaultValue: PropTypes.string,
  style: PropTypes.shape({
    label: PropTypes.object,
    input: PropTypes.object,
  }),
  onChange: PropTypes.func,
  checkValue: PropTypes.func,
  type: PropTypes.oneOf(['text', 'number']),
  className: PropTypes.string,
  value: PropTypes.any,
  format: PropTypes.func,
};

FormikInput.defaultProps = {
  style: {
    label: {},
    input: {},
  },
  onChange: () => {
    return null;
  },
  checkValue: () => true,
  type: 'text',
  className: '',
  value: null,
  format: () => (val) => val,
};

export default FormikInput;
