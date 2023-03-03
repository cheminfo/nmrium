import { Formik, FormikProps } from 'formik';
import { memo, useCallback, useRef } from 'react';

import { useDispatch } from '../context/DispatchContext';
import Button from '../elements/Button';
import Label from '../elements/Label';
import FormikNumberInput from '../elements/formik/FormikNumberInput';
import FormikSelect from '../elements/formik/FormikSelect';
import { AUTO_PEAK_PICKING } from '../reducer/types/Types';

import { headerLabelStyle } from './Header';
import { HeaderContainer } from './HeaderContainer';

const inputStyle = {
  input: {
    width: '50px',
    margin: '0px',
  },
  inputContainer: {
    flex: '2',
  },
  container: {
    height: '100%',
  },
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

const INIT_VALUES = {
  maxNumberOfPeaks: 50,
  minMaxRatio: 0.1,
  noiseFactor: 3,
  direction: 'positive',
};

function AutoPeakPickingOptionPanel() {
  const dispatch = useDispatch();
  const formRef = useRef<FormikProps<any>>(null);

  const handleApplyFilter = useCallback(
    (values) => {
      dispatch({
        type: AUTO_PEAK_PICKING,
        options: values,
      });
    },
    [dispatch],
  );

  return (
    <HeaderContainer>
      <Formik
        innerRef={formRef}
        initialValues={INIT_VALUES}
        onSubmit={handleApplyFilter}
      >
        <>
          <Label title="Direction : " shortTitle="" style={headerLabelStyle}>
            <FormikSelect
              name="direction"
              items={LookFor}
              defaultValue="positive"
              style={{ width: '85px' }}
            />
          </Label>
          <Label
            title="Max Number Of Peaks :"
            shortTitle="Peaks number :"
            style={headerLabelStyle}
          >
            <FormikNumberInput name="maxNumberOfPeaks" style={inputStyle} />
          </Label>
          <Label
            title="Noise factor :"
            shortTitle="Noise :"
            style={headerLabelStyle}
          >
            <FormikNumberInput name="noiseFactor" style={inputStyle} />
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
            />
          </Label>
        </>
      </Formik>

      <Button.Done
        onClick={() => formRef.current?.handleSubmit()}
        style={{ margin: '0 10px' }}
      >
        Apply
      </Button.Done>
    </HeaderContainer>
  );
}

export default memo(AutoPeakPickingOptionPanel);
