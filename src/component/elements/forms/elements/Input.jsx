import { jsx } from '@emotion/core';
/** @jsx jsx */
import { useField } from 'formik';

import ErrorMessage from './ErrorMessage';

const Input = (props) => {
  const [field] = useField(props);

  return (
    <div>
      <input {...field} {...props} />
      <ErrorMessage {...props} />
    </div>
  );
};

export default Input;
