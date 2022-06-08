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
      {enableErrorMessage ? <ErrorMessage {...inputProps} /> : null}
    </div>
  );
}

export default Input;
