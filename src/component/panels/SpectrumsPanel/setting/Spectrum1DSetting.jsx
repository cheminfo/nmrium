import { useCallback, useRef } from 'react';

import FormikColorPicker from '../../../elements/formik/FormikColorPicker';
import FormikForm from '../../../elements/formik/FormikForm';

// ${props => props.index === 2 ? '#f00' : props.index === 1 ? '#0f0' : '#ddd'};
const Spectrum1DSetting = ({ data, onSubmit }) => {
  const refForm = useRef();
  // refForm.current.submitForm();

  const triggerSubmitHandler = useCallback(() => {
    refForm.current.submitForm();
  }, []);

  return (
    <FormikForm ref={refForm} initialValues={data} onSubmit={onSubmit}>
      <div>
        <FormikColorPicker name="color" onColorChange={triggerSubmitHandler} />
      </div>
    </FormikForm>
  );
};

export default Spectrum1DSetting;
