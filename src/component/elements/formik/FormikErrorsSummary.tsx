import { useFormikContext } from 'formik';
import { CSSProperties, useMemo } from 'react';

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

const getErrors = (errorObj: Record<string, any>): string[] => {
  const result: string[] = [];
  function errorsIterators(obj) {
    Object.keys(obj).forEach((key) => {
      if (typeof obj[key] === 'object') {
        errorsIterators(obj[key]);
      } else {
        result.push(obj[key]);
      }
    });
  }

  errorsIterators(errorObj);
  return result;
};

function FormikErrorsSummary({ style }: FormikErrorsSummaryProps) {
  const { errors, isValid } = useFormikContext();

  const errorList = useMemo(() => {
    return getErrors(errors);
  }, [errors]);

  if (isValid) return <div />;

  return (
    <ul style={{ ...styles.container, ...style?.container }}>
      {errorList.map((errorText, index) => {
        return (
          // eslint-disable-next-line react/no-array-index-key
          <li key={index} style={{ ...styles.text, ...style?.text }}>
            {errorText}
          </li>
        );
      })}
    </ul>
  );
}

export default FormikErrorsSummary;
