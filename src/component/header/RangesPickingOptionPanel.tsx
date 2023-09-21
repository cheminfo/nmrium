import { Formik } from 'formik';
import * as Yup from 'yup';

import { useDispatch } from '../context/DispatchContext';
import Button from '../elements/Button';
import Label from '../elements/Label';
import FormikCheckBox from '../elements/formik/FormikCheckBox';
import FormikInput from '../elements/formik/FormikInput';
import { useAlert } from '../elements/popup/Alert';
import {
  MIN_AREA_POINTS,
  useCheckPointsNumberInWindowArea,
} from '../hooks/useCheckPointsNumberInWindowArea';

import { headerLabelStyle } from './Header';
import { HeaderContainer } from './HeaderContainer';

const validationSchema = Yup.object().shape({
  minMaxRatio: Yup.number().min(0).required(),
});

const initialValues = {
  minMaxRatio: 0.05,
  lookNegative: false,
};

function RangesPickingOptionPanel() {
  const dispatch = useDispatch();
  const pointsNumber = useCheckPointsNumberInWindowArea();
  const alert = useAlert();

  function handleRangesPicking(values) {
    if (pointsNumber > MIN_AREA_POINTS) {
      dispatch({
        type: 'AUTO_RANGES_DETECTION',
        payload: values,
      });
    } else {
      alert.error(
        `Auto range picking only available for area more than ${MIN_AREA_POINTS} points`,
      );
    }
  }

  return (
    <HeaderContainer>
      <Formik
        onSubmit={handleRangesPicking}
        initialValues={initialValues}
        validationSchema={validationSchema}
      >
        {({ handleSubmit, isValid }) => (
          <>
            <Label
              title="Detect negative:"
              htmlFor="lookNegative"
              style={headerLabelStyle}
            >
              <FormikCheckBox name="lookNegative" />
            </Label>
            <Label title="Min Max Ratio:" style={headerLabelStyle}>
              <FormikInput
                type="number"
                name="minMaxRatio"
                style={{
                  input: {
                    width: '70px',
                    textAlign: 'center',
                  },
                  inputWrapper: { height: '100%' },
                }}
                step={0.01}
                min={0}
              />
            </Label>

            <Button.Done
              onClick={() => handleSubmit()}
              style={{ margin: '0 10px' }}
              disabled={!isValid}
            >
              Auto ranges picking
            </Button.Done>
          </>
        )}
      </Formik>
    </HeaderContainer>
  );
}

export default RangesPickingOptionPanel;
