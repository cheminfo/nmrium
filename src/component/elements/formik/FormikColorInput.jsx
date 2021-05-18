import { useFormikContext } from 'formik';
import lodashGet from 'lodash/get';
import { useCallback, memo } from 'react';

import ColorInput from '../ColorInput';

function FormikColorPicker({ onColorChange, name, ...props }) {
  const { values, setFieldValue } = useFormikContext();

  const colorChangeHandler = useCallback(
    (color) => {
      onColorChange(color);
      setFieldValue(name, color.hex);
    },
    [name, onColorChange, setFieldValue],
  );
  return (
    <ColorInput
      name={name}
      onColorChange={colorChangeHandler}
      value={lodashGet(values, name)}
      {...props}
    />
  );
}

FormikColorPicker.defaultProps = {
  onColorChange: () => null,
};

export default memo(FormikColorPicker);
