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
  livePreview: boolean;
  options: Apodization1DOptions;
}

const initialValues: ApodizationOptions = {
  options: structuredClone(default1DApodization),
  livePreview: true,
};

export interface UseSharedApodizationOptions {
  validationSchema?: Yup.ObjectSchema<any>;
  applyFilterOnload?: boolean;
  onApplyDispatch: (options: ApodizationOptions) => void;
  onChangeDispatch: (options: ApodizationOptions) => void;
}

export type ApodizationFilterOptions =
  | ExtractFilterEntry<'apodization'>
  | ExtractFilterEntry<'apodizationDimension1'>
  | ExtractFilterEntry<'apodizationDimension2'>;

export const useSharedApodization = (
  filter: ApodizationFilterOptions | null,
  options: UseSharedApodizationOptions,
) => {
  const {
    validationSchema = simpleValidationSchema,
    applyFilterOnload = false,
    onApplyDispatch,
    onChangeDispatch,
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

  const onChange = useCallback(
    (values: ApodizationOptions) => {
      const { livePreview } = values;
      if (livePreview || previousPreviewRef.current !== livePreview) {
        onChangeDispatch(structuredClone(values));
      }
    },
    [onChangeDispatch],
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
        onApplyDispatch(values);
        clearSyncFilterOptions();
      }

      previousPreviewRef.current = livePreview;
    },
    [clearSyncFilterOptions, onApplyDispatch, onChange],
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
