import { Formik } from 'formik';
import lodashMerge from 'lodash/merge';
import { useCallback } from 'react';
import * as Yup from 'yup';

import {
  defaultPredictionOptions,
  FREQUENCIES,
} from '../../../data/PredictionManager';
import { usePreferences } from '../../context/PreferencesContext';
import Label, { LabelStyle } from '../../elements/Label';
import FormikNumberInput from '../../elements/formik/FormikNumberInput';
import FormikOnChange from '../../elements/formik/FormikOnChange';
import FormikSelect from '../../elements/formik/FormikSelect';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';

const predictionFormValidation = Yup.object().shape({
  '1d': Yup.object({
    lineWidth: Yup.number().integer().min(1).required(),
  }),
});

const labelStyle: LabelStyle = {
  label: { fontSize: '10px' },
  wrapper: { display: 'flex', alignItems: 'center', height: '100%' },
  container: { padding: '0 5px', height: '100%' },
};

const selectStyles = { width: '100%', minWidth: '75px', fontSize: '10px' };

function PredictionSimpleOptions() {
  const { dispatch } = usePreferences();
  const predictionPreferences = usePanelPreferences('prediction');

  const optionsChangeHandler = useCallback(
    (values) => {
      const value = lodashMerge({}, defaultPredictionOptions, values);
      dispatch({
        type: 'SET_PANELS_PREFERENCES',
        payload: { key: 'prediction', value },
      });
    },
    [dispatch],
  );

  return (
    <Formik
      initialValues={predictionPreferences}
      validationSchema={predictionFormValidation}
      enableReinitialize
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onSubmit={() => {}}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          flex: '1',
          padding: '0 10px',
          height: '100%',
        }}
      >
        <Label title="Frequency" style={labelStyle}>
          <FormikSelect
            items={FREQUENCIES}
            style={selectStyles}
            name="frequency"
          />
        </Label>
        <Label title="Line Width" style={labelStyle}>
          <FormikNumberInput
            name="1d.lineWidth"
            type="number"
            style={{ margin: 0, width: '40px' }}
          />
          <span style={{ padding: '0 5px' }}>Hz</span>
        </Label>
        <FormikOnChange enableValidation onChange={optionsChangeHandler} />
      </div>
    </Formik>
  );
}

export default PredictionSimpleOptions;
