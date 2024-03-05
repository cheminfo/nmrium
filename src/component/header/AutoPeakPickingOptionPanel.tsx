import { Formik } from 'formik';
import { memo } from 'react';
import * as Yup from 'yup';

import { useDispatch } from '../context/DispatchContext';
import Button from '../elements/Button';
import { InputStyle } from '../elements/Input';
import Label from '../elements/Label';
import FormikInput from '../elements/formik/FormikInput';
import FormikSelect from '../elements/formik/FormikSelect';
import { useAlert } from '../elements/popup/Alert';
import {
  MIN_AREA_POINTS,
  useCheckPointsNumberInWindowArea,
} from '../hooks/useCheckPointsNumberInWindowArea';

import { headerLabelStyle } from './Header';
import { HeaderContainer } from './HeaderContainer';

const inputStyle: InputStyle = {
  input: {
    width: '60px',
    textAlign: 'center',
  },
  inputWrapper: { height: '100%' },
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
  const pointsNumber = useCheckPointsNumberInWindowArea();
  const alert = useAlert();
  function handlePeakPicking(values) {
    if (pointsNumber > MIN_AREA_POINTS) {
      dispatch({
        type: 'AUTO_PEAK_PICKING',
        payload: values,
      });
    } else {
      alert.error(
        `Auto peak picking only available for area more than ${MIN_AREA_POINTS} points`,
      );
    }
  }

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
              <FormikInput
                type="number"
                name="maxNumberOfPeaks"
                style={inputStyle}
                min={0}
                step={1}
              />
            </Label>
            <Label
              title="Noise factor :"
              shortTitle="Noise :"
              style={headerLabelStyle}
            >
              <FormikInput
                type="number"
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
              <FormikInput
                type="number"
                name="minMaxRatio"
                style={inputStyle}
                step={0.01}
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
