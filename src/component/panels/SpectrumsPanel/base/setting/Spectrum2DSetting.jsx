/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback, useRef } from 'react';

import FormikColorPicker from '../../../../elements/formik/FormikColorPicker';
import FormikForm from '../../../../elements/formik/FormikForm';
import FormikInput from '../../../../elements/formik/FormikInput';
import FormikSlider from '../../../../elements/formik/FormikSlider';

function Spectrum2DSetting({ data, onSubmit }) {
  const refForm = useRef();

  const style = css`
    .positive {
      display: inline-block;
      .track-1 {
        background-color: ${data.positiveColor} !important;
      }
    }
    .negative {
      display: inline-block;

      .track-1 {
        background-color: ${data.negativeColor} !important;
      }
    }
  `;

  const triggerSubmitHandler = useCallback(() => {
    refForm.current.submitForm();
  }, []);

  return (
    <FormikForm ref={refForm} initialValues={data} onSubmit={onSubmit}>
      <div css={style}>
        <div className="positive">
          <span style={{ padding: '0 10px' }}>Positive</span>
          <FormikColorPicker
            name="positiveColor"
            onColorChange={triggerSubmitHandler}
          />
          <div style={{ padding: '5px' }}>
            <span className="label">contour Levels [ min - max ]</span>
            <FormikSlider
              name="contourOptions.positive.contourLevels"
              onAfterChange={triggerSubmitHandler}
            />
            <span className="label">number of Layers </span>
            <FormikInput
              name="contourOptions.positive.numberOfLayers"
              onChange={triggerSubmitHandler}
              type="number"
            />
          </div>
        </div>
        <div className="negative">
          <span style={{ padding: '0 10px' }}>Negative</span>
          <FormikColorPicker
            name="negativeColor"
            onColorChange={triggerSubmitHandler}
          />
          <div style={{ padding: '5px' }}>
            <span className="label">contour Levels [ min - max ]</span>
            <FormikSlider
              name="contourOptions.negative.contourLevels"
              onAfterChange={triggerSubmitHandler}
            />
            <span className="label">number of Layers </span>
            <FormikInput
              name="contourOptions.negative.numberOfLayers"
              onChange={triggerSubmitHandler}
              type="number"
            />
          </div>
        </div>
      </div>
    </FormikForm>
  );
}

export default Spectrum2DSetting;
