import { useFormContext, useWatch } from 'react-hook-form';

import { NumberInput2Controller } from '../../../../elements/NumberInput2Controller.js';
import { useEvent } from '../../../../utility/Events.js';

import { useEventFocusInput } from './SignalsContent.js';

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
    setValue,
  } = useFormContext();
  const isNotValid = hasError(errors, index);
  const { signalIndex } = useWatch();
  const { focusSource, setFocusSource } = useEventFocusInput();

  useEvent({
    onClick: ({ xPPM, shiftKey }) => {
      if (index === signalIndex && shiftKey && focusSource === 'delta') {
        setValue(`signals.${index}.delta`, xPPM);
      }
    },
    onBrushEnd: (options) => {
      const {
        range: [from, to],
        shiftKey,
      } = options;
      if (index === signalIndex && shiftKey && focusSource === 'delta') {
        const delta = (to - from) / 2 + from;
        setValue(`signals.${index}.delta`, delta);
      }
    },
  });

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
        onClick={() => {
          setFocusSource('delta');
        }}
      />
      <span>{signal.js.map(({ multiplicity }) => multiplicity).join('')}</span>
    </div>
  );
}
