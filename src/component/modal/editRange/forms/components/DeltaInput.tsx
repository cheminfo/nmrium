import { translateMultiplet } from 'nmr-processing';

import { InputStyle } from '../../../../elements/Input';
import FormikInput from '../../../../elements/formik/FormikInput';

const style: InputStyle = {
  input: {
    width: '50px',
    height: '26px',
  },
  inputWrapper: {
    borderWidth: 0,
    margin: '0 5px',
  },
};

interface DeltaInputProps {
  signal: any;
  index: number;
}

export function DeltaInput({ signal, index }: DeltaInputProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <span>𝛅: </span>
      <FormikInput
        name={`signals.${index}.delta`}
        type="number"
        placeholder={'J (Hz)'}
        style={style}
        checkErrorAfterInputTouched={false}
      />
      <span>
        {signal.js
          .map((_coupling) => translateMultiplet(_coupling.multiplicity))
          .join('')}
      </span>
    </div>
  );
}
