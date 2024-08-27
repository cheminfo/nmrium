import { Tag } from '@blueprintjs/core';
import { forwardRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { FREQUENCIES } from '../../../data/PredictionManager';
import { SpectrumSimulationOptions } from '../../../data/data1d/spectrumSimulation';
import generateNumbersPowerOfX from '../../../data/utilities/generateNumbersPowerOfX';
import Label, { LabelStyle } from '../../elements/Label';
import { NumberInput2Controller } from '../../elements/NumberInput2Controller';
import { Select2Controller } from '../../elements/Select2Controller';
import { PreferencesContainer } from '../extra/preferences/PreferencesContainer';
import { useSettingImperativeHandle } from '../extra/utilities/settingImperativeHandle';

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
  const options = useWatch<SpectrumSimulationOptions>();

  const { handleSubmit, control } = useForm({ defaultValues: options });
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
