import { yupResolver } from '@hookform/resolvers/yup';
import lodashMerge from 'lodash/merge.js';
import { default1DApodization } from 'nmr-processing';
import type { Apodization1DOptions } from 'nmr-processing';
import { useCallback, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

import type { ExtractFilterEntry } from '../../../../../data/types/common/ExtractFilterEntry.js';
import { useDispatch } from '../../../../context/DispatchContext.js';
import { useSyncedFilterOptions } from '../../../../context/FilterSyncOptionsContext.js';

const simpleValidationSchema = Yup.object().shape({
  options: Yup.object().shape({
    exponential: Yup.object()
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
  options: Apodization1DOptions;
  livePreview: boolean;
  tempRollback: boolean;
}

const initialValues: ApodizationOptions = {
  options: structuredClone(default1DApodization),
  livePreview: true,
  tempRollback: true,
};

interface UseSharedApodizationOptions {
  validationSchema?: Yup.ObjectSchema<any>;
  applyFilterOnload?: boolean;
}

export type ApodizationFilterEntry =
  | ExtractFilterEntry<'apodization'>
  | ExtractFilterEntry<'apodizationDimension1'>
  | ExtractFilterEntry<'apodizationDimension2'>;

function useDispatchApodization(filter: ApodizationFilterEntry | null) {
  const dispatch = useDispatch();
  const isNewFilter = !filter?.value;
  const dispatchChange = useCallback(
    (values: ApodizationOptions) => {
      const filterOptions = { ...values };
      if (isNewFilter) {
        filterOptions.tempRollback = false;
      }

      switch (filter?.name) {
        case 'apodization':
          dispatch({
            type: 'CALCULATE_APODIZATION_FILTER',
            payload: filterOptions,
          });

          break;
        case 'apodizationDimension1':
          dispatch({
            type: 'CALCULATE_APODIZATION_DIMENSION_ONE_FILTER',
            payload: filterOptions,
          });

          break;
        case 'apodizationDimension2':
          dispatch({
            type: 'CALCULATE_APODIZATION_DIMENSION_TWO_FILTER',
            payload: filterOptions,
          });

          break;

        default:
          break;
      }
    },
    [dispatch, filter?.name, isNewFilter],
  );

  const dispatchApply = useCallback(
    (values: ApodizationOptions) => {
      const { options } = values;

      switch (filter?.name) {
        case 'apodization':
          dispatch({
            type: 'APPLY_APODIZATION_FILTER',
            payload: { options },
          });

          break;
        case 'apodizationDimension1':
          dispatch({
            type: 'APPLY_APODIZATION_DIMENSION_ONE_FILTER',
            payload: { options },
          });

          break;
        case 'apodizationDimension2':
          dispatch({
            type: 'APPLY_APODIZATION_DIMENSION_TWO_FILTER',
            payload: { options },
          });

          break;

        default:
          break;
      }
    },
    [dispatch, filter?.name],
  );

  return { dispatchChange, dispatchApply };
}

export const useApodization = (
  filter: ApodizationFilterEntry | null,
  options: UseSharedApodizationOptions,
) => {
  const {
    validationSchema = simpleValidationSchema,
    applyFilterOnload = false,
  } = options;
  const dispatch = useDispatch();
  const previousPreviewRef = useRef<boolean>(true);

  const formData = lodashMerge(
    {},
    initialValues,
    filter?.value ? { options: filter?.value } : {},
  );

  const formMethods = useForm<ApodizationOptions>({
    defaultValues: formData,
    resolver: yupResolver(validationSchema),
    mode: 'onChange',
  });

  const { handleSubmit, reset, getValues } = formMethods;

  function syncWatch(sharedFilterOptions) {
    reset(lodashMerge(getValues(), sharedFilterOptions));
  }

  const { syncFilterOptions, clearSyncFilterOptions } =
    useSyncedFilterOptions(syncWatch);

  const { dispatchApply, dispatchChange } = useDispatchApodization(filter);

  const onChange = useCallback(
    (values: ApodizationOptions) => {
      const { livePreview } = values;
      if (livePreview || previousPreviewRef.current !== livePreview) {
        dispatchChange(structuredClone(values));
      }
    },
    [dispatchChange],
  );

  const handleApplyFilter = useCallback(
    (
      values: ApodizationOptions,
      triggerSource: 'apply' | 'onChange' = 'apply',
    ) => {
      const { livePreview } = values;

      if (triggerSource === 'onChange') {
        onChange(values);
      }

      if (triggerSource === 'apply') {
        dispatchApply(values);
        clearSyncFilterOptions();
      }

      previousPreviewRef.current = livePreview;
    },
    [dispatchApply, clearSyncFilterOptions, onChange],
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
    formMethods,
    submitHandler,
    handleApplyFilter,
    handleCancelFilter,
  };
};
