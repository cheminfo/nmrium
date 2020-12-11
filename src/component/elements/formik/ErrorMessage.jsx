/** @jsxImportSource @emotion/react */
import { useField } from 'formik';

const ErrorMessage = ({ style, ...props }) => {
  const meta = useField(props)[1];

  return (
    <div>
      {meta.error ? (
        <p style={{ color: 'red', margin: '0.5px', ...style }}>{meta.error}</p>
      ) : null}
    </div>
  );
};

export default ErrorMessage;
