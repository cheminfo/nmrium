import { useFormikContext } from 'formik';
import lodashGet from 'lodash/get';
import { CSSProperties, ReactNode } from 'react';

const styles: Record<'container' | 'text', CSSProperties> = {
  container: {
    padding: '0.4rem',
    display: 'flex',
    flexDirection: 'column',
  },
  text: {
    color: '#fd000c',
    margin: '0.5px',
    fontSize: '0.9em',
  },
};

export interface FormikErrorProps {
  style?: Partial<Record<'container' | 'text', CSSProperties>>;
  name: string;
  children: ReactNode;
}

function FormikError({ style, name, children }: FormikErrorProps) {
  const { errors, isValid, dirty, touched } = useFormikContext();

  const errorText = lodashGet(errors, name);
  const isTouched = lodashGet(touched, name);

  return (
    <div style={{ ...styles.container, ...style?.container }}>
      {children}
      {!isValid && dirty && isTouched && (
        <span style={{ ...styles.text, ...style?.text }}>{errorText}</span>
      )}
    </div>
  );
}

export default FormikError;
