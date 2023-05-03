import { useFormikContext } from 'formik';
import lodashGet from 'lodash/get';
import { useCallback } from 'react';

import NumberInput, { NumberInputProps } from '../NumberInput';

interface FormikNumberInputProps extends NumberInputProps {
  name: string;
  checkErrorAfterInputTouched?: boolean;
}

function FormikNumberInput(props: FormikNumberInputProps) {
  const {
    name,
    checkErrorAfterInputTouched = false,
    style = {},
    ...resProps
  } = props;
  const { values, errors, touched, handleChange } = useFormikContext();

  const changeHandler = useCallback(
    (e) => {
      handleChange(e);
    },
    [handleChange],
  );

  let isInvalid = lodashGet(errors, name);

  if (checkErrorAfterInputTouched) {
    isInvalid = lodashGet(errors, name) && lodashGet(touched, name);
  }

  return (
    <NumberInput
      name={name}
      value={lodashGet(values, name)}
      onChange={changeHandler}
      style={{
        ...style,
        ...(isInvalid && {
          border: '1px solid red',
          outline: 'none',
        }),
      }}
      {...resProps}
    />
  );
}

export default FormikNumberInput;
