import { useCallback, useRef } from 'react';

import FormikColorPicker from '../../../../elements/formik/FormikColorPicker';
import FormikForm from '../../../../elements/formik/FormikForm';

import Spectrum1DHistogram from './Spectrum1DHistogram';

function Spectrum1DSetting({ data: SpectrumData, onSubmit }) {
  const refForm = useRef();

  const triggerSubmitHandler = useCallback(() => {
    if (refForm.current) {
      refForm.current.submitForm();
    }
  }, []);

  return (
    <FormikForm
      ref={refForm}
      initialValues={SpectrumData.display}
      onSubmit={onSubmit}
    >
      <div>
        <FormikColorPicker name="color" onColorChange={triggerSubmitHandler} />
        <Spectrum1DHistogram color="red" data={SpectrumData.data} />
      </div>
    </FormikForm>
  );
}

export default Spectrum1DSetting;
