import { useFormikContext } from 'formik';
import lodashGet from 'lodash/get';
import { ForwardedRef, forwardRef } from 'react';

import Input, { InputProps } from '../Input';

export interface InputMapValueFunctions {
  mapOnChangeValue?: (value: string | number) => any;
  mapValue?: (value: any) => string | number;
}
interface FormikInputProps extends InputMapValueFunctions {
  name: string;
  checkErrorAfterInputTouched?: boolean;
}

const FormikInput = forwardRef(function FormikInput(
  props: FormikInputProps & InputProps,
  ref: ForwardedRef<HTMLInputElement>,
) {
  const {
    name,
    style = { label: {}, input: {}, inputWrapper: {} },
    onChange,
    type = 'text',
    className = '',
    value = null,
    checkErrorAfterInputTouched = true,
    mapOnChangeValue,
    mapValue,
    ...resProps
  } = props;

  const { values, handleChange, errors, touched, setFieldValue, handleBlur } =
    useFormikContext();

  function changeHandler(e) {
    onChange?.(e);
    if (mapOnChangeValue) {
      void setFieldValue(name, mapOnChangeValue(e.target.value));
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
    <Input
      ref={ref}
      name={name}
      value={val}
      onChange={changeHandler}
      onBlur={handleBlur}
      type={type}
      style={{
        ...style,
        inputWrapper: {
          ...style.inputWrapper,
          ...(isInvalid
            ? {
                borderColor: 'red',
                borderWidth: '1px',
                borderStyle: 'solid',
                outline: 'none',
              }
            : {}),
        },
      }}
      className={className}
      {...resProps}
    />
  );
});

export default FormikInput;
