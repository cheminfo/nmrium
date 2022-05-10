/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import FormikColorPicker from '../../../../elements/formik/FormikColorPicker';
import FormikForm from '../../../../elements/formik/FormikForm';
import FormikInput from '../../../../elements/formik/FormikInput';
import FormikSlider from '../../../../elements/formik/FormikSlider';

import Spectrum2DHistogram from './Spectrum2DHistogram';

interface Spectrum2DSettingProps {
  data: any;
  onSubmit: (values: any, helpers: any) => void;
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
  // const style = css`
  //   .positive {
  //     display: inline-block;
  //     .track-1 {
  //       background-color: ${SpectrumData.display.positiveColor} !important;
  //     }
  //   }
  //   .negative {
  //     display: inline-block;

  //     .track-1 {
  //       background-color: ${SpectrumData.display.negativeColor} !important;
  //     }
  //   }
  // `;
  const { positiveColor, negativeColor } = SpectrumData.display;
  return (
    <FormikForm initialValues={SpectrumData.display} onSubmit={onSubmit}>
      <div>
        <div css={style(positiveColor)}>
          <span style={{ padding: '0 10px' }}>Positive</span>
          <FormikColorPicker name="positiveColor" triggerSubmit />
          <div style={{ padding: '5px' }}>
            <span className="label">contour Levels [ min - max ]</span>
            <FormikSlider
              name="contourOptions.positive.contourLevels"
              triggerSubmit
            />
            <span className="label">number of Layers </span>
            <FormikInput
              name="contourOptions.positive.numberOfLayers"
              triggerSubmit
              type="number"
            />
          </div>
        </div>
        <div css={style(negativeColor)}>
          <span style={{ padding: '0 10px' }}>Negative</span>
          <FormikColorPicker name="negativeColor" triggerSubmit />
          <div style={{ padding: '5px' }}>
            <span className="label">contour Levels [ min - max ]</span>
            <FormikSlider
              name="contourOptions.negative.contourLevels"
              triggerSubmit
            />
            <span className="label">number of Layers </span>
            <FormikInput
              name="contourOptions.negative.numberOfLayers"
              triggerSubmit
              type="number"
            />
          </div>
        </div>
        <Spectrum2DHistogram data={SpectrumData.data} />
      </div>
    </FormikForm>
  );
}

export default Spectrum2DSetting;
