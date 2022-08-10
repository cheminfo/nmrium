import { useFormikContext } from 'formik';
import { useEffect, memo, useRef } from 'react';

interface FormikOnChangeProps {
  onChange?: (any) => void;
  enableValidation?: boolean;
}

const FormikOnChange = (props: FormikOnChangeProps) => {
  const { onChange = () => null, enableValidation = true } = props;
  const oldValuesRef = useRef({});
  const { values, errors, submitForm, setTouched } = useFormikContext();
  useEffect(() => {
    if (enableValidation) {
      if (
        Object.keys(errors).length === 0 &&
        JSON.stringify(oldValuesRef.current) !== JSON.stringify(values)
      ) {
        onChange(values);
      } else {
        setTouched(errors);
      }
    } else {
      onChange(values);
    }
  }, [values, enableValidation, errors, onChange, submitForm, setTouched]);

  return null;
};

export default memo(FormikOnChange);
