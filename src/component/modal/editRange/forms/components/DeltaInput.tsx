import { CSSProperties } from 'react';

import FormikInput from '../../../../elements/formik/FormikInput';
import { translateMultiplet } from '../../../../panels/extra/utilities/MultiplicityUtilities';

const style: Record<'input' | 'container', CSSProperties> = {
  input: {
    width: '50px',
    height: '26px',
    borderWidth: 0,
  },
  container: {
    height: '100%',
  },
};

interface DeltaInputProps {
  signal: any;
  index: number;
  onFocus: (element: any) => void;
}

function DeltaInput({ signal, index, onFocus }: DeltaInputProps) {
  return (
    <div style={{ display: 'flex' }}>
      <span>𝛅:</span>
      <FormikInput
        name={`signals.${index}.delta`}
        type="number"
        placeholder={'J (Hz)'}
        onFocus={onFocus}
        style={style}
        checkErrorAfterInputTouched={false}
      />
      <span>
        {signal.j
          .map((_coupling) => translateMultiplet(_coupling.multiplicity))
          .join('')}
      </span>
    </div>
  );
}

export default DeltaInput;
