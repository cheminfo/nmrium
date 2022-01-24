import { useCallback, useRef } from 'react';

import FormikColorPicker from '../../../../elements/formik/FormikColorPicker';
import FormikForm from '../../../../elements/formik/FormikForm';

import Spectrum1DHistogram from './Spectrum1DHistogram';

interface Spectrum1DSettingProps {
  data: any;
  onSubmit: (values: any, helpers: any) => void;
}

function Spectrum1DSetting({
  data: SpectrumData,
  onSubmit,
}: Spectrum1DSettingProps) {
  const refForm = useRef<any>(null);

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'block', position: 'relative' }}>
          <FormikColorPicker
            name="color"
            onColorChange={triggerSubmitHandler}
          />
        </div>
        <Spectrum1DHistogram color="red" data={SpectrumData.data} />
      </div>
    </FormikForm>
  );
}

export default Spectrum1DSetting;
