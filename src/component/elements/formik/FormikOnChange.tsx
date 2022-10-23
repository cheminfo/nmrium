import { useFormikContext } from 'formik';
import { useEffect, memo, useRef } from 'react';

interface FormikOnChangeProps {
  onChange?: (value: any) => void;
  enableValidation?: boolean;
}

const FormikOnChange = (props: FormikOnChangeProps) => {
  const { onChange = () => null, enableValidation = true } = props;
  const oldValuesRef = useRef<any>({});
  const { values, errors, setTouched, initialValues } = useFormikContext();

  useEffect(() => {

    const isNewValue = JSON.stringify(values) !== JSON.stringify(initialValues)
    if (isNewValue) {
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
    }
    oldValuesRef.current = values;
  }, [values, enableValidation, errors, onChange, setTouched, initialValues]);

  return null;
};

export default memo(FormikOnChange);
