import { jsx } from '@emotion/core';
/** @jsx jsx */
import { useField } from 'formik';
import { Fragment } from 'react';

const ErrorMessage = ({ style = { color: 'red' }, ...props }) => {
  const meta = useField(props)[1];

  return (
    <Fragment>
      {meta.touched && meta.error ? (
        <div className="error" style={style}>
          {meta.error}
        </div>
      ) : null}
    </Fragment>
  );
};

export default ErrorMessage;
