import { useFormikContext } from 'formik';
import lodash from 'lodash';
import PropTypes from 'prop-types';
import { useCallback } from 'react';

import CheckBox from '../CheckBox';

const FormikCheckBox = ({ label, name, onChange, className, reverse }) => {
  const { values, setFieldValue } = useFormikContext();
  const value = reverse ? !lodash.get(values, name) : lodash.get(values, name);

  const changeHandler = useCallback(
    (e) => {
      e.persist();
      onChange(e);
      setFieldValue(name, reverse ? value : !value);
    },
    [name, onChange, reverse, setFieldValue, value],
  );
  return (
    <div className={`${className} check-${value}`}>
      <label htmlFor={name} className="checkbox-lable">
        {label}
      </label>
      <CheckBox
        id={name}
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
  reverse: PropTypes.bool,
};

FormikCheckBox.defaultProps = {
  className: '',
  onChange: () => null,
  reverse: false,
};

export default FormikCheckBox;
