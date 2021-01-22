import { useFormikContext } from 'formik';
import lodash from 'lodash';
import { useCallback, memo } from 'react';
import { SketchPicker } from 'react-color';

import { COLORS } from '../../../data/utilities/getColor';

function FormikColorPicker({ onColorChange, name, ...props }) {
  const { values, setFieldValue } = useFormikContext();

  const colorchangeHandler = useCallback(
    (color) => {
      onColorChange(color);
      setFieldValue(
        name,
        `${color.hex}${Math.round(color.rgb.a * 255).toString(16)}`,
      );
    },
    [name, onColorChange, setFieldValue],
  );

  return (
    <SketchPicker
      color={{ hex: lodash.get(values, name, '#000') }}
      presetColors={COLORS}
      onChangeComplete={(e) => colorchangeHandler(e)}
      {...props}
    />
  );
}

FormikColorPicker.defaultProps = {
  onColorChange: () => null,
};

export default memo(FormikColorPicker);
