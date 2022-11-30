/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Formik } from 'formik';

import FormikColorPicker from '../../../../elements/formik/FormikColorPicker';
import FormikInput from '../../../../elements/formik/FormikInput';
import FormikOnChange from '../../../../elements/formik/FormikOnChange';
import FormikSlider from '../../../../elements/formik/FormikSlider';

import Spectrum2DHistogram from './Spectrum2DHistogram';

interface Spectrum2DSettingProps {
  data: any;
  onSubmit: (values: any) => void;
}

const style = (color: string) => css`
  display: inline-block;
  .track-1 {
    background-color: ${color} !important;
  }
`;

function Spectrum2DSetting({
  data: SpectrumData,
  onSubmit,
}: Spectrum2DSettingProps) {
  const { positiveColor, negativeColor } = SpectrumData.display;
  return (
    <Formik onSubmit={onSubmit} initialValues={SpectrumData.display}>
      <div>
        <div css={style(positiveColor)}>
          <span style={{ padding: '0 10px' }}>Positive</span>
          <FormikColorPicker name="positiveColor" />
          <div style={{ padding: '5px' }}>
            <span className="label">contour Levels [ min - max ]</span>
            <FormikSlider
              name="contourOptions.positive.contourLevels"
              debounceTime={100}
            />
            <span className="label">number of Layers </span>
            <FormikInput
              name="contourOptions.positive.numberOfLayers"
              type="number"
              debounceTime={250}
            />
          </div>
        </div>
        <div css={style(negativeColor)}>
          <span style={{ padding: '0 10px' }}>Negative</span>
          <FormikColorPicker name="negativeColor" />
          <div style={{ padding: '5px' }}>
            <span className="label">contour Levels [ min - max ]</span>
            <FormikSlider
              name="contourOptions.negative.contourLevels"
              debounceTime={100}
            />
            <span className="label">number of Layers </span>
            <FormikInput
              name="contourOptions.negative.numberOfLayers"
              type="number"
              debounceTime={250}
            />
          </div>
        </div>
        <Spectrum2DHistogram data={SpectrumData.data} />
      </div>
      <FormikOnChange onChange={onSubmit} />
    </Formik>
  );
}

export default Spectrum2DSetting;
