import { useFormikContext } from 'formik';
import lodashGet from 'lodash/get';
import { useCallback, useEffect } from 'react';

import Select, { SelectProps } from '../Select';

const FormikSelect = function FormikSelect(
  props: SelectProps & { value?: string },
) {
  const { name = '', value, onChange = () => null, ...resProps } = props;

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
      defaultValue={value || lodashGet(values, name)}
      onChange={changeHandler}
      {...resProps}
    />
  );
};

export default FormikSelect;
