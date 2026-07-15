import type { Jcoupling, Range, Signal1D } from '@zakodium/nmr-types';

import { useDispatch } from '../context/DispatchContext.tsx';

export function useAddMultipletSignal() {
  const dispatch = useDispatch();

  return (options: { range: Range; spectrumId?: string; delta: number }) => {
    const { range, delta, spectrumId } = options;
    const updatedRange = structuredClone(range);
    const signal: Signal1D = {
      id: crypto.randomUUID(),
      delta,
      js: [
        {
          multiplicity: 'm',
        } as Jcoupling,
      ],
      kind: 'signal',
      multiplicity: 'm',
    };
    updatedRange.signals.push(signal);

    dispatch({
      type: 'UPDATE_RANGE',
      payload: {
        range: updatedRange,
        spectrumId,
      },
    });
  };
}
