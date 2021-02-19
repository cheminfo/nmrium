import { useFormikContext } from 'formik';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo } from 'react';

import Input from '../Input';

function FormikInput({
  label,
  name,
  style,
  onChange,
  checkValue,
  type,
  className,
  value,
  format,
  ...resProps
}) {
  const {
    values,
    handleChange,
    setFieldValue,
    errors,
    touched,
  } = useFormikContext();
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

  const isInvalid = useMemo(() => {
    return lodashGet(errors, name) && lodashGet(touched, name);
  }, [errors, name, touched]);
  return (
    <Input
      label={label}
      name={name}
      value={value ? value : lodashGet(values, name)}
      onChange={changeHandler}
      type={type}
      style={{ input: { ...style, ...(isInvalid && { borderColor: 'red' }) } }}
      checkValue={checkValue}
      className={className}
      format={format}
      {...resProps}
    />
  );
}

FormikInput.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string,
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
