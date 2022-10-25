import { ColorPicker } from 'analysis-ui-components';
import { useFormikContext } from 'formik';
import lodashGet from 'lodash/get';
import { memo } from 'react';

import { COLORS } from '../../../data/utilities/getColor';

interface FormikColorPickerProps {
  name: string;
  onColorChange?: (element: any) => void;
}

function FormikColorPicker(props: FormikColorPickerProps) {
  const { onColorChange = () => null, name } = props;

  const { values, setFieldValue } = useFormikContext();

  function colorChangeHandler(color) {
    setFieldValue(
      name,
      `${color.hex}${Math.round(color.rgb.a * 255).toString(16)}`,
      false,
    );
    onColorChange(color);
  }

  return (
    <ColorPicker
      color={{ hex: lodashGet(values, name, '#000') }}
      presetColors={COLORS}
      onChangeComplete={colorChangeHandler}
      style={{ boxShadow: 'none' }}
    />
  );
}

export default memo(FormikColorPicker);
