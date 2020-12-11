import { useCallback, useRef } from 'react';

import FormikColorPicker from '../../../../elements/formik/FormikColorPicker';
import FormikForm from '../../../../elements/formik/FormikForm';

const Spectrum1DSetting = ({ data, onSubmit }) => {
  const refForm = useRef();

  const triggerSubmitHandler = useCallback(() => {
    if (refForm.current) {
      refForm.current.submitForm();
    }
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
