import { FREQUENCIES } from '../../../data/PredictionManager';
import { getSpinSystems } from '../../../data/data1d/spectrumSimulation';
import Label, { LabelStyle } from '../../elements/Label';
import Select from '../../elements/Select';
import FormikInput from '../../elements/formik/FormikInput';
import FormikSelect from '../../elements/formik/FormikSelect';

const SPIN_SYSTEMS = getSpinSystems().map((key) => ({
  label: key,
  value: key,
}));

const labelStyle: LabelStyle = {
  label: { fontSize: '10px' },
  wrapper: { display: 'flex', alignItems: 'center' },
  container: { padding: '0 5px' },
};

const selectStyles = { width: '100%', minWidth: '80px', fontSize: '10px' };

export default function SpectrumSimulationSimpleOptions({
  onSpinSystemChange,
  spinSystem,
}: {
  onSpinSystemChange: (value: string) => void;
  spinSystem: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        flex: '1',
      }}
    >
      <Label title="" style={labelStyle}>
        <Select
          items={SPIN_SYSTEMS}
          style={selectStyles}
          onChange={onSpinSystemChange}
          value={spinSystem}
        />
      </Label>
      <Label title="Frequency" style={labelStyle}>
        <FormikSelect
          items={FREQUENCIES}
          style={selectStyles}
          name="options.frequency"
        />
      </Label>
      <Label title="Line Width" style={labelStyle}>
        <FormikInput
          name="options.lineWidth"
          type="number"
          style={{
            input: {
              width: '40px',
              textAlign: 'center',
            },
          }}
        />
        <span style={{ padding: '0 5px' }}>Hz</span>
      </Label>
    </div>
  );
}
