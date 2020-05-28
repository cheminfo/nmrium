import { jsx } from '@emotion/core';
/** @jsx jsx */
import { useField } from 'formik';
import { Fragment } from 'react';

import ErrorMessage from './ErrorMessage';

const Input = (props) => {
  const [field] = useField(props);

  return (
    <Fragment>
      <input {...field} {...props} />
      <ErrorMessage {...props} />
    </Fragment>
  );
};

export default Input;
