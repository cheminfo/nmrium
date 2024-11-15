import { yupResolver } from '@hookform/resolvers/yup';
import type { BaselineCorrectionOptions } from 'nmr-processing';
import { useCallback, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useSelect } from 'react-science/ui';
import * as Yup from 'yup';

import type { ExtractFilterEntry } from '../../../../../data/types/common/ExtractFilterEntry.js';
import { useDispatch } from '../../../../context/DispatchContext.js';
import { useSyncedFilterOptions } from '../../../../context/FilterSyncOptionsContext.js';

export const baselineCorrectionsAlgorithms = ['airPLS', 'Polynomial'].map(
  (val) => ({
    label: val,
    value: val.toLowerCase(),
  }),
);

interface BaseOptions {
  algorithm: string;
  livePreview: boolean;
}
interface AirplsOptions extends BaseOptions {
  maxIterations: number;
  tolerance: number;
}
interface PolynomialOptions extends BaseOptions {
  degree: number;
}

function findAlgorithmItem(algorithmName: string) {
  return baselineCorrectionsAlgorithms.find(
    (item) => item.value === algorithmName,
  );
}

export function getBaselineData(
  algorithm,
  filterValues?: BaselineCorrectionOptions | null,
) {
  const { algorithm: baseAlgorithm, ...other } = filterValues || {};
  switch (algorithm) {
    case 'airpls': {
      const validation = Yup.object().shape({
        algorithm: Yup.string().required(),
        livePreview: Yup.boolean().required(),
        maxIterations: Yup.number().integer().min(1).required(),
        tolerance: Yup.number().moreThan(0).required(),
      });
      return {
        resolver: yupResolver(validation),
        values: {
          algorithm,
          livePreview: true,
          maxIterations: 100,
          tolerance: 0.001,
          ...(baseAlgorithm === 'airpls' ? other : {}),
        },
      };
    }
    case 'autoPolynomial':
    case 'polynomial': {
      const validation = Yup.object().shape({
        algorithm: Yup.string().required(),
        livePreview: Yup.boolean().required(),
        degree: Yup.number().integer().min(1).max(6).required(),
      });

      return {
        resolver: yupResolver(validation),
        values: {
          algorithm,
          livePreview: true,
          degree: 3,
          ...(baseAlgorithm === 'polynomial' ? other : {}),
        },
      };
    }
    default:
      return {
        resolver: yupResolver(
          Yup.object({
            livePreview: Yup.boolean().required(),
          }),
        ),
        values: { livePreview: true },
      };
  }
}

export function useBaselineCorrection(
  filter: ExtractFilterEntry<'baselineCorrection'> | null,
) {
  const dispatch = useDispatch();
  const previousPreviewRef = useRef<boolean>(true);
  const { algorithm: baseAlgorithm = 'polynomial' } = filter?.value || {};
  const {
    value: algorithm,
    onItemSelect: onAlgorithmChange,
    ...defaultAlgorithmSelectProps
  } = useSelect({
    defaultSelectedItem: findAlgorithmItem(baseAlgorithm),
    itemTextKey: 'label',
  });

  const { resolver, values } = getBaselineData(algorithm?.value, filter?.value);

  const { handleSubmit, reset, ...otherFormOptions } = useForm<
    AirplsOptions | PolynomialOptions
  >({
    defaultValues: values,
    resolver: resolver as any,
  });

  function syncWatch(sharedFilterOptions) {
    const { algorithm } = sharedFilterOptions;
    const algorithmItem = findAlgorithmItem(algorithm);
    if (algorithmItem) {
      onAlgorithmChange(algorithmItem);
    }
    reset(sharedFilterOptions);
  }

  const { syncFilterOptions, clearSyncFilterOptions } =
    useSyncedFilterOptions(syncWatch);

  const onChange = useCallback(
    (values) => {
      const { livePreview, ...options } = values;

      if (livePreview || previousPreviewRef !== livePreview) {
        dispatch({
          type: 'CALCULATE_BASE_LINE_CORRECTION_FILTER',
          payload: {
            options,
            livePreview,
          },
        });
      }
    },
    [dispatch],
  );

  const handleApplyFilter = (
    values,
    triggerSource: 'apply' | 'onChange' = 'apply',
  ) => {
    const { livePreview, ...options } = values;

    switch (triggerSource) {
      case 'onChange': {
        onChange(values);
        syncFilterOptions(values);
        break;
      }

      case 'apply': {
        dispatch({
          type: 'APPLY_BASE_LINE_CORRECTION_FILTER',
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
  };

  const handleCancelFilter = () => {
    dispatch({
      type: 'RESET_SELECTED_TOOL',
    });
  };

  function submitHandler() {
    void handleSubmit((values) => handleApplyFilter(values, 'onChange'))();
  }

  useEffect(() => {
    void handleSubmit((values) => onChange(values))();
  }, [handleSubmit, onChange]);

  return {
    algorithm,
    defaultAlgorithmSelectProps,
    onAlgorithmChange,
    handleSubmit,
    submitHandler,
    handleApplyFilter,
    handleCancelFilter,
    reset,
    ...otherFormOptions,
  };
}
