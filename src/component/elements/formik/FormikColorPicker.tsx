import { ColorPicker } from 'analysis-ui-components';
import { useFormikContext } from 'formik';
import lodashGet from 'lodash/get';
import { useCallback, memo } from 'react';

import { COLORS } from '../../../data/utilities/getColor';

interface FormikColorPickerProps {
  name: string;
  onColorChange?: (element: any) => void;
  triggerSubmit?: boolean;
}

function FormikColorPicker(props: FormikColorPickerProps) {
  const { onColorChange = () => null, name, triggerSubmit = false } = props;

  const { values, setFieldValue, submitForm } = useFormikContext();
  const colorChangeHandler = useCallback(
    (color) => {
      setFieldValue(
        name,
        `${color.hex}${Math.round(color.rgb.a * 255).toString(16)}`,
        false,
      );
      onColorChange(color);
      if (triggerSubmit) {
        setTimeout(submitForm, 1);
      }
    },
    [name, onColorChange, setFieldValue, submitForm, triggerSubmit],
  );

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
