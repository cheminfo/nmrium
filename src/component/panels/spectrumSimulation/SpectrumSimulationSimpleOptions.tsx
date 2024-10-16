import { Tag } from '@blueprintjs/core';
import { useFormContext } from 'react-hook-form';

import { FREQUENCIES } from '../../../data/PredictionManager.js';
import { getSpinSystems } from '../../../data/data1d/spectrumSimulation.js';
import Label, { LabelStyle } from '../../elements/Label.js';
import { NumberInput2Controller } from '../../elements/NumberInput2Controller.js';
import { Select2 } from '../../elements/Select2.js';
import { Select2Controller } from '../../elements/Select2Controller.js';

const SPIN_SYSTEMS = getSpinSystems().map((key) => ({
  label: key,
  value: key,
}));

const labelStyle: LabelStyle = {
  label: { fontSize: '10px' },
  wrapper: { display: 'flex', alignItems: 'center' },
  container: { padding: '0 5px' },
};

export default function SpectrumSimulationSimpleOptions({
  onSpinSystemChange,
  spinSystem,
}: {
  onSpinSystemChange: (value: string) => void;
  spinSystem: string;
}) {
  const { control } = useFormContext();
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        flex: '1',
      }}
    >
      <Label title="" style={labelStyle}>
        <Select2
          items={SPIN_SYSTEMS}
          onItemSelect={({ value }) => onSpinSystemChange(value)}
          selectedItemValue={spinSystem}
          selectedButtonProps={{ minimal: true, small: true }}
        />
      </Label>
      <Label title="Frequency" style={labelStyle}>
        <Select2Controller
          control={control}
          items={FREQUENCIES}
          selectedButtonProps={{ minimal: true, small: true }}
          name="options.frequency"
        />
      </Label>
      <Label title="Line width" style={labelStyle}>
        <NumberInput2Controller
          control={control}
          name="options.lineWidth"
          small
          controllerProps={{ rules: { required: true, min: 0.1 } }}
          min={0.1}
          stepSize={0.1}
          majorStepSize={1}
          rightElement={<Tag>Hz</Tag>}
          style={{ width: 70 }}
        />
      </Label>
    </div>
  );
}
