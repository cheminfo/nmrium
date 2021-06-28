import { useField } from 'formik';

import ErrorMessage from './ErrorMessage';

interface InputProps {
  name: string;
  onFocus?: (element: string) => void;
  onBlur?: (element: string) => void;
  enableErrorMessage?: boolean;
}

function Input(props: InputProps) {
  const {
    onFocus = () => null,
    onBlur = () => null,
    enableErrorMessage,
    ...inputProps
  } = props;

  const [field] = useField(inputProps);

  return (
    <div>
      <input
        {...field}
        {...props}
        onFocus={() => onFocus(field.name)}
        onBlur={() => onBlur(field.name)}
      />
      {enableErrorMessage && enableErrorMessage === true ? (
        <ErrorMessage {...inputProps} />
      ) : null}
    </div>
  );
}

Input.defaultProps = {
  onFocus: () => null,
  onBlur: () => null,
};

export default Input;
