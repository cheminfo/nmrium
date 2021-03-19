import { useFormikContext } from 'formik';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import { useCallback } from 'react';

import CheckBox from '../CheckBox';

function FormikCheckBox({
  label,
  name,
  onChange,
  className,
  reverse,
  ...resProps
}) {
  const { values, setFieldValue } = useFormikContext();
  const value = reverse ? !lodashGet(values, name) : lodashGet(values, name);

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
        {...resProps}
      />
    </div>
  );
}

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
