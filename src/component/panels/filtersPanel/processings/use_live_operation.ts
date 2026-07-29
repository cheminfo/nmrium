import type { SpectrumProcessingOperation } from '@zakodium/nmrium-core';
import { useEventCallback } from 'usehooks-ts';

import { useChartData } from '../../../context/ChartContext.tsx';
import { useDispatch } from '../../../context/DispatchContext.tsx';

export function useLiveOperation() {
  const {
    processingOperators: { liveOperation },
  } = useChartData();
  const dispatch = useDispatch();

  const setLiveOperation = useEventCallback(function setLiveOperation<
    Operation extends SpectrumProcessingOperation<unknown, unknown> | undefined,
  >(liveOperation: Operation): Operation {
    if (liveOperation) liveOperation = { ...liveOperation, options: undefined };
    dispatch({ type: 'SET_LIVE_OPERATION', payload: { liveOperation } });
    return liveOperation;
  });

  return [liveOperation, setLiveOperation] as const;
}
