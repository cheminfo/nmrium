import { useField } from 'formik';
import { CSSProperties } from 'react';

const styles: CSSProperties = {
  color: 'red',
  margin: '0.5px',
};

export interface ErrorMessageProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  style?: CSSProperties;
}

function ErrorMessage({ style, ...props }: ErrorMessageProps) {
  const [, { error }] = useField(props);

  if (!error) return <div />;

  return (
    <div>
      <p style={{ ...styles, ...style }}>{error}</p>
    </div>
  );
}

export default ErrorMessage;
