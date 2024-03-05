import { Formik } from 'formik';
import { useCallback } from 'react';
import * as Yup from 'yup';

import { useDispatch } from '../context/DispatchContext';
import Button from '../elements/Button';
import Label from '../elements/Label';
import FormikInput from '../elements/formik/FormikInput';
import FormikOnChange from '../elements/formik/FormikOnChange';

import { headerLabelStyle } from './Header';
import { HeaderContainer } from './HeaderContainer';

const validationSchema = Yup.object().shape({
  zonesNoiseFactor: Yup.number().min(0).required(),
});

const initialValues = {
  zonesNoiseFactor: 1,
};

function Zones2DOptionPanel() {
  const dispatch = useDispatch();

  const handleZonesPicking = useCallback(
    (values) => {
      dispatch({
        type: 'AUTO_ZONES_DETECTION',
        payload: values,
      });
    },
    [dispatch],
  );

  const handleChangeNoiseFactory = useCallback(
    (values) => {
      dispatch({ type: 'CHANGE_ZONES_NOISE_FACTOR', payload: values });
    },
    [dispatch],
  );

  return (
    <HeaderContainer>
      <Formik
        onSubmit={handleZonesPicking}
        initialValues={initialValues}
        validationSchema={validationSchema}
      >
        {({ handleSubmit, isValid }) => (
          <>
            <Label
              title="Noise factor :"
              htmlFor="livePreview"
              style={headerLabelStyle}
            >
              <FormikInput
                type="number"
                name="zonesNoiseFactor"
                style={{
                  input: { width: '50px', textAlign: 'center' },
                  inputWrapper: { height: '100%' },
                }}
                min={0}
                step={1}
              />
            </Label>
            <FormikOnChange
              enableValidation
              onChange={handleChangeNoiseFactory}
            />
            <Button.Done
              onClick={() => handleSubmit()}
              style={{ margin: '0 10px' }}
              disabled={!isValid}
            >
              Auto Zones Picking
            </Button.Done>
          </>
        )}
      </Formik>
    </HeaderContainer>
  );
}

export default Zones2DOptionPanel;
