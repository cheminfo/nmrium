import { Formik } from 'formik';
import { useCallback } from 'react';
import * as Yup from 'yup';

import { useDispatch } from '../context/DispatchContext';
import Button from '../elements/Button';
import Label from '../elements/Label';
import FormikCheckBox from '../elements/formik/FormikCheckBox';
import FormikNumberInput from '../elements/formik/FormikNumberInput';
import { AUTO_RANGES_DETECTION } from '../reducer/types/Types';

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

  const handleRangesPicking = useCallback(
    (values) => {
      dispatch({
        type: AUTO_RANGES_DETECTION,
        payload: values,
      });
    },
    [dispatch],
  );
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
              <FormikNumberInput
                name="minMaxRatio"
                style={{
                  width: '70px',
                }}
                step="0.01"
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
