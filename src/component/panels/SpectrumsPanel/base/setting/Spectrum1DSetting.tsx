import { Formik } from 'formik';

import FormikColorPicker from '../../../../elements/formik/FormikColorPicker';
import FormikOnChange from '../../../../elements/formik/FormikOnChange';

import Spectrum1DHistogram from './Spectrum1DHistogram';

interface Spectrum1DSettingProps {
  data: any;
  onSubmit: (values: any) => void;
}

function Spectrum1DSetting({
  data: SpectrumData,
  onSubmit,
}: Spectrum1DSettingProps) {
  return (
    <Formik initialValues={SpectrumData.display} onSubmit={onSubmit}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'block', position: 'relative' }}>
          <FormikColorPicker name="color" />
        </div>
        <Spectrum1DHistogram color="red" data={SpectrumData.data} />
      </div>
      <FormikOnChange onChange={onSubmit} />
    </Formik>
  );
}

export default Spectrum1DSetting;
