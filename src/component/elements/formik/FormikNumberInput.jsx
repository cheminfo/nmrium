import { useFormikContext } from 'formik';
import lodashGet from 'lodash/get';
import { useCallback } from 'react';

import NumberInput from '../NumberInput';

function FormikNumberInput({ label, name, ...resProps }) {
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
