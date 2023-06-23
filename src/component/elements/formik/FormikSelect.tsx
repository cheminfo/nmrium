import { useFormikContext } from 'formik';
import lodashGet from 'lodash/get';
import { useCallback, useEffect } from 'react';

import Select, { SelectProps } from '../Select';

const FormikSelect = function FormikSelect(
  props: SelectProps & {
    value?: string;
    checkErrorAfterInputTouched?: boolean;
  },
) {
  const {
    name = '',
    value,
    onChange = () => null,
    checkErrorAfterInputTouched = true,
    style,
    ...resProps
  } = props;

  const { values, errors, touched, setFieldValue } = useFormikContext();
  const changeHandler = useCallback(
    (value) => {
      onChange(value);
      void setFieldValue(name, value);
    },
    [name, onChange, setFieldValue],
  );
  useEffect(() => {
    if (value) {
      void setFieldValue(name, value);
    }
  }, [name, setFieldValue, value]);

  let isInvalid = lodashGet(errors, name);

  if (checkErrorAfterInputTouched) {
    isInvalid = lodashGet(errors, name) && lodashGet(touched, name);
  }
  return (
    <Select
      name={name}
      key={String(value || lodashGet(values, name))}
      defaultValue={value || lodashGet(values, name)}
      onChange={changeHandler}
      style={{ ...style, ...(isInvalid && { border: '1px solid red' }) }}
      {...resProps}
    />
  );
};

export default FormikSelect;
