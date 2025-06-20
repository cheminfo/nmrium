import type { ZeroFillingOptions as BaseZeroFillingOptions } from '@zakodium/nmr-types';
import type { NmrData2DFid } from 'cheminfo-types';
import { useCallback, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';

import { isSpectrum1D } from '../../../../../data/data1d/Spectrum1D/index.js';
import { isSpectrum2D } from '../../../../../data/data2d/Spectrum2D/index.js';
import type { ExtractFilterEntry } from '../../../../../data/types/common/ExtractFilterEntry.js';
import generateNumbersPowerOfX from '../../../../../data/utilities/generateNumbersPowerOfX.js';
import { useDispatch } from '../../../../context/DispatchContext.js';
import { useSyncedFilterOptions } from '../../../../context/FilterSyncOptionsContext.js';
import useTempSpectrum from '../../../../hooks/useTempSpectrum.js';

type ZeroFillingOptions = BaseZeroFillingOptions & {
  livePreview: boolean;
};

interface UseZeroFillingOptions {
  applyFilterOnload?: boolean;
}

export function getZeroFillingNbPoints(filter: ZeroFillingEntry) {
  if (filter.name === 'zeroFilling') {
    return generateNumbersPowerOfX(8, 21);
  }

  return generateNumbersPowerOfX(8, 12);
}

function getZeroFillingSize(length: number) {
  return 2 ** Math.round(Math.log2(length * 2));
}

function useZeroFillingDefaultSize() {
  const spectrum = useTempSpectrum();

  if (!spectrum) return 0;

  if (isSpectrum1D(spectrum)) {
    return getZeroFillingSize(spectrum.data.x.length);
  }

  if (isSpectrum2D(spectrum)) {
    const data = (spectrum.data as NmrData2DFid).re;
    const nbPoints = getZeroFillingSize(data.z[0].length);
    return Math.min(4096, nbPoints);
  }
}

export type ZeroFillingEntry =
  | ExtractFilterEntry<'zeroFilling'>
  | ExtractFilterEntry<'zeroFillingDimension1'>
  | ExtractFilterEntry<'zeroFillingDimension2'>;

const useDispatchZeroFilling = (filter: ZeroFillingEntry | null) => {
  const dispatch = useDispatch();

  const defaultNbPoints = useZeroFillingDefaultSize();

  const dispatchApply = useCallback(
    (data: ZeroFillingOptions) => {
      const { nbPoints } = data;

      if (filter?.name === 'zeroFilling') {
        dispatch({
          type: 'APPLY_ZERO_FILLING_FILTER',
          payload: { options: { nbPoints } },
        });
      }
      if (filter?.name === 'zeroFillingDimension1') {
        dispatch({
          type: 'APPLY_ZERO_FILLING_DIMENSION_ONE_FILTER',
          payload: { options: { nbPoints } },
        });
      }
      if (filter?.name === 'zeroFillingDimension2') {
        dispatch({
          type: 'APPLY_ZERO_FILLING_DIMENSION_TWO_FILTER',
          payload: { options: { nbPoints } },
        });
      }
    },
    [dispatch, filter?.name],
  );
  const dispatchChange = useCallback(
    (data: ZeroFillingOptions) => {
      const { livePreview, nbPoints } = data;

      if (filter?.name === 'zeroFilling') {
        dispatch({
          type: 'CALCULATE_ZERO_FILLING_FILTER',
          payload: {
            options: { nbPoints },
            livePreview,
          },
        });
      }

      if (filter?.name === 'zeroFillingDimension1') {
        dispatch({
          type: 'CALCULATE_ZERO_FILLING_DIMENSION_ONE_FILTER',
          payload: {
            options: { nbPoints },
            livePreview,
          },
        });
      }

      if (filter?.name === 'zeroFillingDimension2') {
        dispatch({
          type: 'CALCULATE_ZERO_FILLING_DIMENSION_TWO_FILTER',
          payload: {
            options: { nbPoints },
            livePreview,
          },
        });
      }
    },
    [dispatch, filter?.name],
  );

  return { defaultNbPoints, dispatchApply, dispatchChange };
};

export const useZeroFilling = (
  filter: ZeroFillingEntry | null,
  options: UseZeroFillingOptions = {},
) => {
  const { applyFilterOnload = false } = options;

  const dispatch = useDispatch();
  const { dispatchChange, dispatchApply, defaultNbPoints } =
    useDispatchZeroFilling(filter);
  const previousPreviewRef = useRef<boolean>(true);

  const { handleSubmit, register, reset, control, getValues, formState } =
    useForm({
      defaultValues: {
        nbPoints: filter?.value?.nbPoints || defaultNbPoints,
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
      const { livePreview } = values;

      if (livePreview || previousPreviewRef !== livePreview) {
        dispatchChange(values);
      }
    },
    [dispatchChange],
  );

  function handleApplyFilter(
    values,
    triggerSource: 'apply' | 'onChange' = 'apply',
  ) {
    const { livePreview } = values;

    if (triggerSource === 'onChange') {
      onChange(values);
      syncFilterOptions(values);
    }

    if (triggerSource === 'apply') {
      dispatchApply(values);
      clearSyncFilterOptions();
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
