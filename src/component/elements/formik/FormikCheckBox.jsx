import { useFormikContext } from 'formik';
import lodash from 'lodash';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import CheckBox from '../CheckBox';

const FormikCheckBox = ({ label, name, onChange, className, reverse }) => {
  const { values, setFieldValue } = useFormikContext();
  const value = reverse ? !lodash.get(values, name) : lodash.get(values, name);

  const changeHandler = useCallback(
    (e) => {
      e.persist();
      onChange(e);
      setFieldValue(name, value);
    },
    [name, onChange, setFieldValue, value],
  );
  return (
    <div className={`${className} check-${value}`}>
      <span className="checkbox-lable">{label}</span>
      <CheckBox
        name={name}
        checked={value}
        onChange={changeHandler}
        className="checkbox"
      />
    </div>
  );
};

FormikCheckBox.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string,
  className: PropTypes.string,
  onChange: PropTypes.func,
};

FormikCheckBox.defaultProps = {
  className: '',
  onChange: () => null,
};

export default FormikCheckBox;
