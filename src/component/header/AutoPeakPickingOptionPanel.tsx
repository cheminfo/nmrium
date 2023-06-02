import { Formik } from 'formik';
import { memo, useCallback } from 'react';
import * as Yup from 'yup';

import { useDispatch } from '../context/DispatchContext';
import Button from '../elements/Button';
import Label from '../elements/Label';
import FormikNumberInput from '../elements/formik/FormikNumberInput';
import FormikSelect from '../elements/formik/FormikSelect';

import { headerLabelStyle } from './Header';
import { HeaderContainer } from './HeaderContainer';

const inputStyle = {
  width: '60px',
};

const LookFor = [
  {
    label: 'Positive',
    value: 'positive',
  },
  {
    label: 'Negative',
    value: 'negative',
  },
  {
    label: 'Both',
    value: 'both',
  },
];

const validationSchema = Yup.object().shape({
  maxNumberOfPeaks: Yup.number().min(0).required(),
  minMaxRatio: Yup.number().min(0).required(),
  noiseFactor: Yup.number().min(0).required(),
});

const INIT_VALUES = {
  maxNumberOfPeaks: 50,
  minMaxRatio: 0.1,
  noiseFactor: 3,
  direction: 'positive',
};

function AutoPeakPickingOptionPanel() {
  const dispatch = useDispatch();

  const handlePeakPicking = useCallback(
    (values) => {
      dispatch({
        type: 'AUTO_PEAK_PICKING',
        payload: values,
      });
    },
    [dispatch],
  );

  return (
    <HeaderContainer>
      <Formik
        initialValues={INIT_VALUES}
        onSubmit={handlePeakPicking}
        validationSchema={validationSchema}
      >
        {({ handleSubmit, isValid }) => (
          <>
            <Label title="Direction : " shortTitle="" style={headerLabelStyle}>
              <FormikSelect
                name="direction"
                items={LookFor}
                style={{ width: '85px' }}
              />
            </Label>
            <Label
              title="Max Number Of Peaks :"
              shortTitle="Peaks number :"
              style={headerLabelStyle}
            >
              <FormikNumberInput
                name="maxNumberOfPeaks"
                style={inputStyle}
                min={0}
              />
            </Label>
            <Label
              title="Noise factor :"
              shortTitle="Noise :"
              style={headerLabelStyle}
            >
              <FormikNumberInput
                name="noiseFactor"
                style={inputStyle}
                min={0}
              />
            </Label>
            <Label
              title="Min Max Ratio :"
              shortTitle="Ratio :"
              style={headerLabelStyle}
            >
              <FormikNumberInput
                name="minMaxRatio"
                style={inputStyle}
                step="0.01"
                min={0}
              />
            </Label>
            <Button.Done
              onClick={() => handleSubmit()}
              style={{ margin: '0 10px' }}
              disabled={!isValid}
            >
              Apply
            </Button.Done>
          </>
        )}
      </Formik>
    </HeaderContainer>
  );
}

export default memo(AutoPeakPickingOptionPanel);
