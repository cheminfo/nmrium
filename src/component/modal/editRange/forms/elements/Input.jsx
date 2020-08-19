import { jsx } from '@emotion/core';
/** @jsx jsx */
import { useField } from 'formik';

import ErrorMessage from './ErrorMessage';

const Input = ({ onFocus, onBlur, ...props }) => {
  const [field] = useField(props);
  return (
    <div>
      <input
        {...field}
        {...props}
        onFocus={() => onFocus(field.name)}
        onBlur={() => onBlur(field.name)}
      />
      <ErrorMessage {...props} />
    </div>
  );
};

Input.defaultProps = {
  onFocus: () => null,
  onBlur: () => null,
};

export default Input;
