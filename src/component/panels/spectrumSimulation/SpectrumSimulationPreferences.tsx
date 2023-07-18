import { Formik, FormikProps } from 'formik';
import { forwardRef, useImperativeHandle, useRef } from 'react';

import { FREQUENCIES } from '../../../data/PredictionManager';
import { SpectrumSimulationOptions } from '../../../data/data1d/spectrumSimulation';
import generateNumbersPowerOfX from '../../../data/utilities/generateNumbersPowerOfX';
import { InputStyle } from '../../elements/Input';
import Label, { LabelStyle } from '../../elements/Label';
import FormikInput from '../../elements/formik/FormikInput';
import FormikSelect from '../../elements/formik/FormikSelect';
import { PreferencesContainer } from '../extra/preferences/PreferencesContainer';

const SIMULATION_NUMBER_OF_POINTS = generateNumbersPowerOfX(12, 19);

const selectStyles = {
  width: '100%',
  minWidth: '50px',
  maxWidth: '280px',
  height: 30,
  margin: 0,
};

const labelStyle: LabelStyle = {
  label: { flex: 3, fontWeight: '500' },
  wrapper: { flex: 9, display: 'flex', alignItems: 'center' },
  container: { padding: '5px' },
};

const inputStyle: InputStyle = {
  input: {
    padding: '5px',
  },
};

export interface SpectrumSimulationPreferencesRefProps {
  saveSetting: () => void;
}
interface SpectrumSimulationPreferencesProps {
  options: SpectrumSimulationOptions;
  onSave: (options: SpectrumSimulationOptions) => void;
}
function SpectrumSimulationPreferences(
  { options, onSave }: SpectrumSimulationPreferencesProps,
  ref,
) {
  const formRef = useRef<FormikProps<any>>(null);

  useImperativeHandle(
    ref,
    () => ({
      saveSetting: () => {
        void formRef.current?.submitForm();
      },
    }),
    [],
  );

  return (
    <PreferencesContainer style={{ backgroundColor: 'white' }}>
      <Formik initialValues={options} onSubmit={onSave} innerRef={formRef}>
        <>
          <Label title="Frequency" style={labelStyle}>
            <FormikSelect
              items={FREQUENCIES}
              style={selectStyles}
              name="options.frequency"
            />
          </Label>
          <Label title="Number of Points" style={labelStyle}>
            <FormikSelect
              items={SIMULATION_NUMBER_OF_POINTS}
              name="options.nbPoints"
              style={selectStyles}
            />
          </Label>

          <Label title="Range" style={labelStyle}>
            <Label title="From">
              <FormikInput
                name="options.from"
                type="number"
                style={inputStyle}
              />
            </Label>
            <Label title="To" style={{ label: { padding: '0 10px' } }}>
              <FormikInput name="options.to" type="number" style={inputStyle} />
            </Label>
          </Label>

          <Label title="Line Width" style={labelStyle}>
            <FormikInput
              name="options.lineWidth"
              type="number"
              style={inputStyle}
            />
            <span style={{ paddingLeft: '0.4rem' }}> Hz </span>
          </Label>
        </>
      </Formik>
    </PreferencesContainer>
  );
}

export default forwardRef(SpectrumSimulationPreferences);
