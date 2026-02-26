import { yupResolver } from '@hookform/resolvers/yup';
import type { BaselineCorrectionOptions } from '@zakodium/nmr-types';
import { useCallback, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useSelect } from 'react-science/ui';
import * as Yup from 'yup';

import type { ExtractFilterEntry } from '../../../../../data/types/common/ExtractFilterEntry.js';
import { useDispatch } from '../../../../context/DispatchContext.js';
import { useSyncedFilterOptions } from '../../../../context/FilterSyncOptionsContext.js';

const ALGORITHM_LABELS: Record<BaselineCorrectionOptions['algorithm'], string> =
  {
    airpls: 'airPLS',
    polynomial: 'Polynomial',
    whittaker: 'Whittaker',
    cubic: 'Cubic',
    bernstein: 'Bernstein',
  };

export const baselineCorrectionsAlgorithms = (
  Object.keys(ALGORITHM_LABELS) as Array<BaselineCorrectionOptions['algorithm']>
).map((value) => ({ value, label: ALGORITHM_LABELS[value] }));
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
interface WhittakerOptions extends BaseOptions {
  lambda: number;
  scale: number;
  maxIterations: number;
}
interface BernsteinOptions extends BaseOptions {
  maxIterations: number;
  tolerance: number;
  factorStd: number;
  learningRate: number;
  minWeight: number;
}

function findAlgorithmItem(algorithmName: string) {
  return baselineCorrectionsAlgorithms.find(
    (item) => item.value === algorithmName,
  );
}

export function getBaselineData(
  algorithm: any,
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
    case 'whittaker': {
      const validation = Yup.object().shape({
        lambda: Yup.number().integer().required(),
        scale: Yup.number().integer().required(),
        maxIterations: Yup.number().integer().required(),
      });

      return {
        resolver: yupResolver(validation),
        values: {
          algorithm,
          livePreview: true,
          lambda: 150,
          scale: 1,
          maxIterations: 1,
          ...(baseAlgorithm === 'whittaker' ? other : {}),
        },
      };
    }
    case 'cubic': {
      return {
        resolver: null,
        values: {
          algorithm,
          livePreview: true,
        },
      };
    }
    case 'bernstein': {
      const validation = Yup.object().shape({
        maxIterations: Yup.number().integer().required(),
        tolerance: Yup.number().required(),
        factorStd: Yup.number().integer().required(),
        learningRate: Yup.number().required(),
        minWeight: Yup.number().required(),
      });

      return {
        resolver: yupResolver(validation),
        values: {
          algorithm,
          livePreview: true,
          maxIterations: 100,
          tolerance: 1e-6,
          factorStd: 3,
          learningRate: 0.3,
          minWeight: 0.01,
          ...(baseAlgorithm === 'bernstein' ? other : {}),
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
    AirplsOptions | PolynomialOptions | WhittakerOptions | BernsteinOptions
  >({
    defaultValues: values,
    resolver: resolver as any,
  });

  function syncWatch(sharedFilterOptions: any) {
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
    (values: any) => {
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
    values: any,
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
