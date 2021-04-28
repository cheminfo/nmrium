import { useFormikContext } from 'formik';
import lodashGet from 'lodash/get';
import { useCallback, useEffect } from 'react';

import Select from '../Select';

const FormikSelect = function FormikSelect({
  name,
  value,
  onChange,
  ...resProps
}) {
  const { values, setFieldValue } = useFormikContext();
  const changeHandler = useCallback(
    (value) => {
      onChange(value);
      setFieldValue(name, value);
    },
    [name, onChange, setFieldValue],
  );

  useEffect(() => {
    if (value) {
      setFieldValue(name, value);
    }
  }, [name, setFieldValue, value]);

  return (
    <Select
      name={name}
      defaultValue={value ? value : lodashGet(values, name)}
      onChange={changeHandler}
      {...resProps}
    />
  );
};
// eslint-disable-next-line react/forbid-foreign-prop-types
FormikSelect.propTypes = Select.propTypes;
FormikSelect.defaultProps = Select.defaultProps;

export default FormikSelect;
