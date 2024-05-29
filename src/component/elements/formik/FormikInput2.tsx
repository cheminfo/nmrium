import { useFormikContext } from 'formik';
import lodashGet from 'lodash/get';
import { ForwardedRef, forwardRef } from 'react';

import { Input2, Input2Props } from '../Input2';

export interface InputMapValueFunctions {
  mapOnChangeValue?: (value: string | number) => any;
  mapValue?: (value: any) => string | number;
}
interface FormikInputProps<FilterType>
  extends Input2Props<FilterType>,
    InputMapValueFunctions {
  name: string;
  checkErrorAfterInputTouched?: boolean;
}

const FormikInput2 = forwardRef(function FormikInput2(
  props: FormikInputProps<string>,
  ref: ForwardedRef<HTMLInputElement>,
) {
  const {
    name,
    onChange,
    type = 'text',
    value = null,
    checkErrorAfterInputTouched = true,
    mapOnChangeValue,
    mapValue,
    ...resProps
  } = props;

  const { values, handleChange, errors, touched, setFieldValue, handleBlur } =
    useFormikContext();

  function changeHandler(value, e) {
    onChange?.(value, e);
    if (mapOnChangeValue) {
      void setFieldValue(name, mapOnChangeValue(value));
    } else {
      handleChange(e);
    }
  }
  let isInvalid = lodashGet(errors, name);

  if (checkErrorAfterInputTouched) {
    isInvalid = lodashGet(errors, name) && lodashGet(touched, name);
  }

  let val = value || lodashGet(values, name);
  val = mapValue ? mapValue(val) : val;

  return (
    <Input2
      ref={ref}
      name={name}
      value={val}
      onChange={changeHandler}
      onBlur={handleBlur}
      type={type}
      intent={isInvalid ? 'danger' : 'none'}
      {...resProps}
    />
  );
});

export default FormikInput2;
