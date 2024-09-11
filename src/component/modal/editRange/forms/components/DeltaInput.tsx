import { translateMultiplet } from 'nmr-processing';
import { useFormContext } from 'react-hook-form';

import { NumberInput2Controller } from '../../../../elements/NumberInput2Controller';

interface DeltaInputProps {
  signal: any;
  index: number;
}

function hasError(errors, i) {
  return !!errors?.signals?.[i];
}

export function DeltaInput({ signal, index }: DeltaInputProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const isNotValid = hasError(errors, index);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        color: isNotValid ? 'red' : 'black',
      }}
    >
      <span>𝛅: </span>
      <NumberInput2Controller
        control={control}
        name={`signals.${index}.delta`}
        placeholder="Delta (PPM)"
        style={{
          width: 50,
          height: 20,
          minHeight: 20,
          paddingRight: 0,
          paddingLeft: 0,
        }}
        fill
        noShadowBox
        buttonPosition="none"
        debounceTime={250}
      />
      <span>
        {signal.js
          .map((_coupling) => translateMultiplet(_coupling.multiplicity))
          .join('')}
      </span>
    </div>
  );
}
