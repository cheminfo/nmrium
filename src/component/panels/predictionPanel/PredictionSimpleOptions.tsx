import { Tag } from '@blueprintjs/core';
import { yupResolver } from '@hookform/resolvers/yup';
import lodashMerge from 'lodash/merge.js';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

import {
  FREQUENCIES,
  getDefaultPredictionOptions,
} from '../../../data/PredictionManager.js';
import { usePreferences } from '../../context/PreferencesContext.js';
import type { LabelStyle } from '../../elements/Label.js';
import Label from '../../elements/Label.js';
import { NumberInput2Controller } from '../../elements/NumberInput2Controller.js';
import { Select2Controller } from '../../elements/Select2Controller.js';
import { usePanelPreferences } from '../../hooks/usePanelPreferences.js';

const predictionFormValidation = Yup.object().shape({
  frequency: Yup.number().integer().required().label('Frequency'),
  '1d': Yup.object({
    lineWidth: Yup.number().integer().min(1).required(),
  }),
});

const labelStyle: LabelStyle = {
  label: { fontSize: '10px' },
  wrapper: { display: 'flex', alignItems: 'center', height: '100%' },
  container: { padding: '0 5px', height: '100%' },
};

function PredictionSimpleOptions() {
  const { dispatch } = usePreferences();
  const predictionPreferences = usePanelPreferences('prediction');

  const optionsChangeHandler = useCallback(
    (values) => {
      const value = lodashMerge({}, getDefaultPredictionOptions(), values);
      dispatch({
        type: 'SET_PANELS_PREFERENCES',
        payload: { key: 'prediction', value },
      });
    },
    [dispatch],
  );

  const { watch, reset, control } = useForm({
    defaultValues: predictionPreferences,
    resolver: yupResolver(predictionFormValidation),
  });

  useEffect(() => {
    reset(predictionPreferences, { keepValues: true });
  }, [predictionPreferences, reset]);

  useEffect(() => {
    const { unsubscribe } = watch(async (values) => {
      const isValid = await predictionFormValidation.isValid(values);
      if (!isValid) return;

      optionsChangeHandler(values);
    });
    return () => unsubscribe();
  }, [optionsChangeHandler, watch]);

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
        flex: '1',
        height: '100%',
      }}
    >
      <Label title="Frequency" style={labelStyle}>
        <Select2Controller
          control={control}
          name="frequency"
          items={FREQUENCIES}
          selectedButtonProps={{ variant: 'minimal', size: 'small' }}
        />
      </Label>
      <Label title="Line width" style={labelStyle}>
        <NumberInput2Controller
          control={control}
          name="1d.lineWidth"
          size="small"
          controllerProps={{ rules: { required: true, min: 1 } }}
          min={1}
          stepSize={1}
          majorStepSize={1}
          rightElement={<Tag>Hz</Tag>}
          style={{ width: 70 }}
        />
      </Label>
    </div>
  );
}

export default PredictionSimpleOptions;
