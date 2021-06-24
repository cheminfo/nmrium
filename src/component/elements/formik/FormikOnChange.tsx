import { useFormikContext } from 'formik';
import { useEffect } from 'react';

interface FormikOnChangeProps {
  onChange?: (any) => void;
  enableValidation?: boolean;
}

const FormikOnChange = (props: FormikOnChangeProps) => {
  const { onChange = () => null, enableValidation = true } = props;
  const { values, errors } = useFormikContext();

  useEffect(() => {
    if (enableValidation) {
      if (Object.keys(errors).length === 0) {
        onChange(values);
      }
    } else {
      onChange(values);
    }
  }, [values, enableValidation, errors, onChange]);

  return null;
};

export default FormikOnChange;
