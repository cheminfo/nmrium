import { useFormikContext } from 'formik';
import lodashGet from 'lodash/get';
import { ColorPickerDropdown, ColorPickerProps } from 'react-science/ui';

interface FormikColorPickerDropdownProps extends ColorPickerProps {
  name: string;
}

function FormikColorPickerDropdown(props: FormikColorPickerDropdownProps) {
  const { onChangeComplete = () => null, name, ...colorPickerProps } = props;

  const { values, setFieldValue } = useFormikContext();

  function colorChangeHandler(color) {
    onChangeComplete(color);
    void setFieldValue(name, color.hex);
  }

  return (
    <ColorPickerDropdown
      {...colorPickerProps}
      onChangeComplete={colorChangeHandler}
      color={{ hex: lodashGet(values, name) }}
    />
  );
}

export default FormikColorPickerDropdown;
