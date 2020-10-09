import { useFormikContext } from 'formik';
import lodash from 'lodash';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import Input from '../Input';

const FormikInput = ({ label, name, style, onChange, checkValue, type }) => {
  const { values, handleChange } = useFormikContext();

  const changeHandler = useCallback(
    (e) => {
      onChange(e);
      handleChange(e);
    },
    [handleChange, onChange],
  );

  return (
    <Input
      label={label}
      name={name}
      value={lodash.get(values, name)}
      onChange={changeHandler}
      type={type}
      style={style}
      checkValue={checkValue}
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
};

export default FormikInput;
