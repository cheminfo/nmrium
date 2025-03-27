import { Tag } from '@blueprintjs/core';
import { yupResolver } from '@hookform/resolvers/yup';
import { forwardRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { FREQUENCIES } from '../../../data/PredictionManager.js';
import type { SpectrumSimulationOptions } from '../../../data/data1d/spectrumSimulation.js';
import generateNumbersPowerOfX from '../../../data/utilities/generateNumbersPowerOfX.js';
import type { LabelStyle } from '../../elements/Label.js';
import Label from '../../elements/Label.js';
import { NumberInput2Controller } from '../../elements/NumberInput2Controller.js';
import { Select2Controller } from '../../elements/Select2Controller.js';
import { PreferencesContainer } from '../extra/preferences/PreferencesContainer.js';
import { useSettingImperativeHandle } from '../extra/utilities/settingImperativeHandle.js';

import { simulationValidationSchema } from './simulationValidation.js';

const SIMULATION_NUMBER_OF_POINTS = generateNumbersPowerOfX(12, 19);

const labelStyle: LabelStyle = {
  label: { flex: 3, fontWeight: '500' },
  wrapper: { flex: 9, display: 'flex', alignItems: 'center' },
  container: { padding: '5px' },
};

interface SpectrumSimulationPreferencesProps {
  onSave: (options: SpectrumSimulationOptions) => void;
}
function SpectrumSimulationPreferences(
  { onSave }: SpectrumSimulationPreferencesProps,
  ref,
) {
  const options = useWatch() as Required<SpectrumSimulationOptions>;

  const { handleSubmit, control } = useForm({
    defaultValues: options,
    resolver: yupResolver(simulationValidationSchema),
  });
  useSettingImperativeHandle(ref, handleSubmit, onSave);

  return (
    <PreferencesContainer style={{ backgroundColor: 'white' }}>
      <Label title="Frequency" style={labelStyle}>
        <Select2Controller
          control={control}
          items={FREQUENCIES}
          name="options.frequency"
        />
      </Label>
      <Label title="Number of points" style={labelStyle}>
        <Select2Controller
          control={control}
          items={SIMULATION_NUMBER_OF_POINTS}
          name="options.nbPoints"
        />
      </Label>

      <Label title="Range" style={labelStyle}>
        <Label title="From">
          <NumberInput2Controller
            control={control}
            name="options.from"
            controllerProps={{ rules: { required: true } }}
            fill
            allowNumericCharactersOnly
          />
        </Label>
        <Label title="To" style={{ label: { padding: '0 10px' } }}>
          <NumberInput2Controller
            control={control}
            name="options.to"
            controllerProps={{ rules: { required: true } }}
            fill
            allowNumericCharactersOnly
          />
        </Label>
      </Label>

      <Label title="Line width" style={labelStyle}>
        <NumberInput2Controller
          control={control}
          name="options.lineWidth"
          min={0.1}
          stepSize={0.1}
          majorStepSize={1}
          controllerProps={{ rules: { required: true, min: 0.1 } }}
          rightElement={<Tag>Hz</Tag>}
          allowNumericCharactersOnly
        />
      </Label>
    </PreferencesContainer>
  );
}

export default forwardRef(SpectrumSimulationPreferences);
