import { yupResolver } from '@hookform/resolvers/yup';
import type { Apodization1DOptions as BaseApodizationOptions } from 'nmr-processing';
import { useCallback, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

import { defaultApodizationOptions } from '../../../../../data/constants/DefaultApodizationOptions.js';
import type { ExtractFilterEntry } from '../../../../../data/types/common/ExtractFilterEntry.js';
import { useDispatch } from '../../../../context/DispatchContext.js';
import { useSyncedFilterOptions } from '../../../../context/FilterSyncOptionsContext.js';

const simpleValidationSchema = Yup.object().shape({
  options: Yup.object().shape({
    gaussian: Yup.object()
      .shape({
        options: Yup.object().shape({
          lineBroadening: Yup.number().required(),
        }),
      })
      .notRequired(),
  }),
  livePreview: Yup.boolean().required(),
});

export interface ApodizationOptions {
  livePreview: boolean;
  options: BaseApodizationOptions;
}

const initialValues: ApodizationOptions = {
  options: defaultApodizationOptions,
  livePreview: true,
};

interface UseSharedApodizationOptions {
  validationSchema?: Yup.ObjectSchema<any>;
  applyFilterOnload?: boolean;
}

export const useSharedApodization = (
  filter: ExtractFilterEntry<'apodization'> | null,
  options: UseSharedApodizationOptions,
) => {
  const {
    validationSchema = simpleValidationSchema,
    applyFilterOnload = false,
  } = options;

  const dispatch = useDispatch();
  const previousPreviewRef = useRef<boolean>(true);

  let formData = initialValues;

  if (filter) {
    formData = { ...initialValues, options: filter.value, livePreview: true };
  }

  const { handleSubmit, register, control, reset, getValues, formState } =
    useForm<ApodizationOptions>({
      defaultValues: formData,
      resolver: yupResolver(validationSchema),
      mode: 'onChange',
    });

  function syncWatch(sharedFilterOptions) {
    reset({ ...getValues(), ...sharedFilterOptions });
  }

  const { syncFilterOptions, clearSyncFilterOptions } =
    useSyncedFilterOptions(syncWatch);

  const onChange = useCallback(
    (values: ApodizationOptions) => {
      const { livePreview, options } = values;
      if (livePreview || previousPreviewRef.current !== livePreview) {
        dispatch({
          type: 'CALCULATE_APODIZATION_FILTER',
          payload: { livePreview, options },
        });
      }
    },
    [dispatch],
  );

  const handleApplyFilter = useCallback(
    (
      values: ApodizationOptions,
      triggerSource: 'apply' | 'onChange' = 'apply',
    ) => {
      const { livePreview, options } = values;
      switch (triggerSource) {
        case 'onChange': {
          onChange(values);
          break;
        }
        case 'apply': {
          dispatch({
            type: 'APPLY_APODIZATION_FILTER',
            payload: { options },
          });
          clearSyncFilterOptions();

          break;
        }
        default:
          break;
      }

      previousPreviewRef.current = livePreview;
    },
    [clearSyncFilterOptions, dispatch, onChange],
  );

  const handleCancelFilter = useCallback(() => {
    dispatch({
      type: 'RESET_SELECTED_TOOL',
    });
    clearSyncFilterOptions();
  }, [clearSyncFilterOptions, dispatch]);

  const submitHandler = useCallback(() => {
    void handleSubmit((values) => {
      syncFilterOptions(values);
      handleApplyFilter(values, 'onChange');
    })();
  }, [handleSubmit, syncFilterOptions, handleApplyFilter]);

  useEffect(() => {
    if (applyFilterOnload) {
      void handleSubmit((values) => onChange(values))();
    }
  }, [applyFilterOnload, handleSubmit, onChange]);

  return {
    handleSubmit,
    register,
    control,
    formState,
    submitHandler,
    handleApplyFilter,
    handleCancelFilter,
  };
};
