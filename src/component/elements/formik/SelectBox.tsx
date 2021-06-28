/** @jsxImportSource @emotion/react */
import { Field, useField } from 'formik';

import ErrorMessage, { ErrorMessageProps } from './ErrorMessage';

interface SelectBoxProps extends ErrorMessageProps {
  values: Array<any>;
}

function SelectBox({ values, ...props }: SelectBoxProps) {
  const [field] = useField(props);

  return values && values.length > 0 ? (
    <div>
      <Field as="select" {...field} {...props}>
        {values.map((value, i) => {
          return (
            <option
              // eslint-disable-next-line react/no-array-index-key
              key={i}
            >
              {value}
            </option>
          );
        })}
      </Field>
      <ErrorMessage {...props} />
    </div>
  ) : null;
}

export default SelectBox;
