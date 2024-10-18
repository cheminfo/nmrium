import type { NmrData1D } from 'cheminfo-types';
import type {
  Filter,
  ZeroFillingOptions as BaseZeroFillingOptions,
} from 'nmr-processing';
import { useCallback, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';

import generateNumbersPowerOfX from '../../../../../data/utilities/generateNumbersPowerOfX.js';
import { useDispatch } from '../../../../context/DispatchContext.js';
import { useSyncedFilterOptions } from '../../../../context/FilterSyncOptionsContext.js';
import useSpectrum from '../../../../hooks/useSpectrum.js';

export type ZeroFillingOptions = BaseZeroFillingOptions & {
  livePreview: boolean;
};

interface UseZeroFillingOptions {
  applyFilterOnload?: boolean;
}

export const zeroFillingSizes = generateNumbersPowerOfX(8, 21);

function useZeroFillingDefaultSize() {
  const { data } = useSpectrum();
  if (data) {
    return 2 ** Math.round(Math.log2((data as NmrData1D).x.length * 2));
  }
  return 0;
}

export const useZeroFilling = (
  filter: Filter | null,
  options: UseZeroFillingOptions = {},
) => {
  const { applyFilterOnload = false } = options;

  const defaultNbPoints = useZeroFillingDefaultSize();

  const dispatch = useDispatch();
  const previousPreviewRef = useRef<boolean>(true);
  const { handleSubmit, register, reset, control, getValues, formState } =
    useForm({
      defaultValues: {
        nbPoints:
          (filter?.value as BaseZeroFillingOptions)?.nbPoints ||
          defaultNbPoints,
        livePreview: true,
      },
    });

  function syncWatch(sharedFilterOptions) {
    reset({ ...getValues(), ...sharedFilterOptions });
  }

  const { syncFilterOptions, clearSyncFilterOptions } =
    useSyncedFilterOptions(syncWatch);

  const onChange = useCallback(
    (values) => {
      const { livePreview, ...options } = values;

      if (livePreview || previousPreviewRef !== livePreview) {
        dispatch({
          type: 'CALCULATE_ZERO_FILLING_FILTER',
          payload: {
            options,
            livePreview,
          },
        });
      }
    },
    [dispatch],
  );

  function handleApplyFilter(
    values,
    triggerSource: 'apply' | 'onChange' = 'apply',
  ) {
    const { livePreview, ...options } = values;
    switch (triggerSource) {
      case 'onChange': {
        onChange(values);
        syncFilterOptions(values);
        break;
      }

      case 'apply': {
        dispatch({
          type: 'APPLY_ZERO_FILLING_FILTER',
          payload: {
            options,
          },
        });
        clearSyncFilterOptions();
        break;
      }
      default:
        break;
    }
    previousPreviewRef.current = livePreview;
  }

  function handleCancelFilter() {
    dispatch({
      type: 'RESET_SELECTED_TOOL',
    });
    clearSyncFilterOptions();
  }

  function submitHandler(triggerSource: 'apply' | 'onChange' = 'apply') {
    void handleSubmit((values) => handleApplyFilter(values, triggerSource))();
  }

  useEffect(() => {
    if (applyFilterOnload) {
      void handleSubmit((values) => onChange(values))();
    }
  }, [applyFilterOnload, handleSubmit, onChange]);

  return {
    handleSubmit,
    register,
    control,
    submitHandler,
    handleApplyFilter,
    handleCancelFilter,
    formState,
  };
};
