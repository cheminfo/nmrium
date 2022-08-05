import { useFormikContext } from 'formik';
import lodashGet from 'lodash/get';
import { useCallback } from 'react';

import NumberInput, { NumberInputProps } from '../NumberInput';

interface FormikNumberInputProps extends NumberInputProps {
  label?: string;
  name: string;
}

function FormikNumberInput(props: FormikNumberInputProps) {
  const { label, name, ...resProps } = props;
  const { values, handleChange } = useFormikContext();

  const changeHandler = useCallback(
    (e) => {
      handleChange(e);
    },
    [handleChange],
  );

  return (
    <NumberInput
      label={label}
      name={name}
      defaultValue={lodashGet(values, name)}
      onChange={changeHandler}
      {...resProps}
    />
  );
}

export default FormikNumberInput;
