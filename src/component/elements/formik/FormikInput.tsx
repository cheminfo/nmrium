import { useFormikContext } from 'formik';
import lodashGet from 'lodash/get';

import Input, { InputProps } from '../Input';

interface FormikInputProps extends InputProps {
  name: string;
  checkErrorAfterInputTouched?: boolean;
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
    format = () => (value) => value,
    checkErrorAfterInputTouched = true,
    ...resProps
  } = props;

  const { values, handleChange, errors, touched } = useFormikContext();

  function changeHandler(e) {
    onChange(e);
    handleChange(e);
  }

  let isInvalid = lodashGet(errors, name);

  if (checkErrorAfterInputTouched) {
    isInvalid = lodashGet(errors, name) && lodashGet(touched, name);
  }

  return (
    <Input
      name={name}
      value={value ? value : lodashGet(values, name)}
      onChange={changeHandler}
      type={type}
      style={{
        ...style,
        inputWrapper: {
          ...style.input,
          ...(isInvalid && { borderColor: 'red', outline: 'none' }),
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
