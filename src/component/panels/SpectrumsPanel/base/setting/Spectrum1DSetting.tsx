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
  return (
    <FormikForm initialValues={SpectrumData.display} onSubmit={onSubmit}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'block', position: 'relative' }}>
          <FormikColorPicker name="color" triggerSubmit />
        </div>
        <Spectrum1DHistogram color="red" data={SpectrumData.data} />
      </div>
    </FormikForm>
  );
}

export default Spectrum1DSetting;
