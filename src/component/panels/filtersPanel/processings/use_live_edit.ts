import type { SpectrumProcessingOperation } from '@zakodium/nmr-types';
import { assertDefined } from '@zakodium/utils';

import { useChartData } from '../../../context/ChartContext.tsx';
import { useDispatch } from '../../../context/DispatchContext.tsx';
import { useProcessingsMutations } from '../../../context/processings_mutations_context.tsx';

export type UseLiveEdit = ReturnType<typeof useLiveEdit>;

export function useLiveEdit(
  operation: SpectrumProcessingOperation<unknown, unknown> | undefined,
) {
  const {
    processingOperators: { liveEdit: value, liveOperation },
  } = useChartData();
  const dispatch = useDispatch();
  const processingsMutations = useProcessingsMutations();

  function setLiveEditCheck(newValue: boolean) {
    if (!value) return;

    dispatch({ type: 'SET_LIVE_EDIT_CHECKED', payload: newValue });

    if (!newValue) {
      processingsMutations.resetLiveChange(true);
    } else {
      assertDefined(operation);
      void processingsMutations.prepareLiveChange(
        operation.uid,
        value.shouldProcessNext,
      );
    }
  }

  function setShouldProcessNext(newValue: boolean) {
    if (!value) return;
    if (!liveOperation) return;

    dispatch({ type: 'SET_LIVE_EDIT_SHOULD_PROCESS_NEXT', payload: newValue });
    void processingsMutations.applyLiveChange(
      { ...liveOperation, options: undefined },
      newValue,
    );
  }

  return { value, setLiveEditCheck, setShouldProcessNext };
}
