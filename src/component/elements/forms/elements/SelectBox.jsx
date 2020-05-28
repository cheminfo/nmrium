import { jsx } from '@emotion/core';
/** @jsx jsx */
import { Field, useField, useFormikContext } from 'formik';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { useMemo, memo } from 'react';

import ErrorMessage from './ErrorMessage';

const SelectBox = memo(
  ({ valuesObjectPath, valueSelectionTemplate, ...props }) => {
    const [field] = useField(props);
    const { values } = useFormikContext();

    const _values = useMemo(() => {
      return get(values, valuesObjectPath, []);
    }, [valuesObjectPath, values]);

    return _values && _values.length > 0 ? (
      <div>
        <Field as="select" {...field} {...props}>
          {_values.map((value, i) => {
            return (
              <option
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                value={i}
              >
                {valueSelectionTemplate(value)}
              </option>
            );
          })}
        </Field>
        <ErrorMessage {...props} />
      </div>
    ) : null;
  },
);

SelectBox.protoTypes = {
  valuePath: PropTypes.instanceOf(Array).isRequired,
  valueSelectionTemplate: PropTypes.func,
};

export default SelectBox;
