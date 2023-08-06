import { FREQUENCIES } from '../../../data/PredictionManager';
import { getSpinSystems } from '../../../data/data1d/spectrumSimulation';
import Label, { LabelStyle } from '../../elements/Label';
import Select from '../../elements/Select';
import FormikNumberInput from '../../elements/formik/FormikNumberInput';
import FormikSelect from '../../elements/formik/FormikSelect';

const SPIN_SYSTEMS = getSpinSystems().map((key) => ({
  label: key,
  value: key,
}));

const labelStyle: LabelStyle = {
  label: { fontSize: '10px' },
  wrapper: { display: 'flex', alignItems: 'center', height: '100%' },
  container: { padding: '0 5px', height: '100%' },
};

const selectStyles = { width: '100%', minWidth: '75px', fontSize: '10px' };

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
        padding: '0 10px',
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
        <FormikNumberInput
          name="options.lineWidth"
          type="number"
          style={{ margin: 0, width: '40px' }}
        />
        <span style={{ padding: '0 5px' }}>Hz</span>
      </Label>
    </div>
  );
}
