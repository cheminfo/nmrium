import { useFormikContext } from 'formik';
import { CSSProperties } from 'react';

const styles: Record<'container' | 'text', CSSProperties> = {
  container: {
    backgroundColor: '#fd000c',
    borderRadius: '5px',
    padding: '0.4rem',
  },
  text: {
    color: 'white',
    margin: '0.5px',
    fontSize: '0.9em',
    listStyle: 'inside',
  },
};

export interface FormikErrorsSummaryProps {
  style?: Record<'container' | 'text', CSSProperties>;
}

function FormikErrorsSummary({ style }: FormikErrorsSummaryProps) {
  const { errors, isValid } = useFormikContext();

  if (isValid) return <div />;

  return (
    <ul style={{ ...styles.container, ...style?.container }}>
      {Object.entries(errors).map(([key, errorText]) => {
        return (
          <li key={key} style={{ ...styles.text, ...style?.text }}>
            {errorText as string}
          </li>
        );
      })}
    </ul>
  );
}

export default FormikErrorsSummary;
