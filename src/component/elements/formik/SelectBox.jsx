/** @jsxImportSource @emotion/react */
import { Field, useField } from 'formik';
import PropTypes from 'prop-types';

import ErrorMessage from './ErrorMessage';

function SelectBox({ values, ...props }) {
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

SelectBox.protoTypes = {
  valuePath: PropTypes.instanceOf(Array).isRequired,
  valueSelectionTemplate: PropTypes.func,
};

export default SelectBox;
