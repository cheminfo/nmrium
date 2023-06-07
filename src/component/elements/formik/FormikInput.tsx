import { useFormikContext } from 'formik';
import lodashGet from 'lodash/get';

import Input, { InputProps } from '../Input';

export interface InputMapValueFunctions {
  mapOnChangeValue?: (value: string | number) => any;
  mapValue?: (value: any) => string | number;
}
interface FormikInputProps extends InputProps, InputMapValueFunctions {
  name: string;
  checkErrorAfterInputTouched?: boolean;
}

function identity<T = unknown>(value: T): T {
  return value;
}

function FormikInput(props: FormikInputProps) {
  const {
    name,
    style = { label: {}, input: {} },
    onChange = () => null,
    checkValue = () => true,
    type = 'text',
    className = '',
    value = null,
    format = () => identity,
    checkErrorAfterInputTouched = true,
    mapOnChangeValue,
    mapValue,
    ...resProps
  } = props;

  const { values, handleChange, errors, touched, setFieldValue } =
    useFormikContext();

  function changeHandler(e) {
    onChange(e);
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
      name={name}
      value={val}
      onChange={changeHandler}
      type={type}
      style={{
        ...style,
        inputWrapper: {
          ...style.input,
          ...(isInvalid && {
            border: '1px solid red',
            outline: 'none',
          }),
        },
      }}
      checkValue={checkValue}
      className={className}
      format={format}
      {...resProps}
    />
  );
}

export default FormikInput;
