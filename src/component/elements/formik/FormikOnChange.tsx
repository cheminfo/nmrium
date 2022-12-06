import { useFormikContext } from 'formik';
import { useEffect, memo, useRef } from 'react';

interface FormikOnChangeProps {
  onChange?: (value: any) => void;
  enableValidation?: boolean;
  enableOnload?: boolean;
}

const FormikOnChange = (props: FormikOnChangeProps) => {
  const {
    onChange = () => null,
    enableValidation = true,
    enableOnload = false,
  } = props;
  const { values, errors, setTouched, initialValues } = useFormikContext();
  const previousValuesRef = useRef<any>(enableOnload ? {} : initialValues);

  useEffect(() => {
    const isChanged =
      JSON.stringify(previousValuesRef.current) !== JSON.stringify(values);
    if (isChanged) {
      if (enableValidation) {
        if (Object.keys(errors).length === 0 && isChanged) {
          onChange(values);
        } else {
          setTouched(errors);
        }
      } else {
        onChange(values);
      }
    }

    previousValuesRef.current = values;
  }, [values, enableValidation, errors, onChange, setTouched, initialValues]);

  return null;
};

export default memo(FormikOnChange);
