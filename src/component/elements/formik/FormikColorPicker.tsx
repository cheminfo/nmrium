import { useFormikContext } from 'formik';
import lodashGet from 'lodash/get';
import { useCallback, memo } from 'react';
import { SketchPicker } from 'react-color';

import { COLORS } from '../../../data/utilities/getColor';

interface FormikColorPickerProps {
  name: string;
  onColorChange?: (element: any) => void;
}

function FormikColorPicker(props: FormikColorPickerProps) {
  const { onColorChange = () => null, name } = props;

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
      color={{ hex: lodashGet(values, name, '#000') }}
      presetColors={COLORS}
      onChangeComplete={(e) => colorchangeHandler(e)}
    />
  );
}

export default memo(FormikColorPicker);
