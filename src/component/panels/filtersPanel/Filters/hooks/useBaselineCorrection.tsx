import { yupResolver } from '@hookform/resolvers/yup';
import type { BaselineCorrectionOptions } from '@zakodium/nmr-types';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useSelect } from 'react-science/ui';
import * as Yup from 'yup';

import type { ExtractFilterEntry } from '../../../../../data/types/common/ExtractFilterEntry.js';
import { useDispatch } from '../../../../context/DispatchContext.js';
import { useSyncedFilterOptions } from '../../../../context/FilterSyncOptionsContext.js';
import type { AlgorithmOptions } from '../base/baselineCorrectionFields.ts';

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

function findAlgorithmItem(algorithmName: string) {
  return baselineCorrectionsAlgorithms.find(
    (item) => item.value === algorithmName,
  );
}


function getBaselineResolver(algorithm: any) {
  switch (algorithm) {
    case 'airpls':
      return yupResolver(
        Yup.object().shape({
          algorithm: Yup.string().required(),
          livePreview: Yup.boolean().required(),
          maxIterations: Yup.number().integer().min(1).required(),
          tolerance: Yup.number().moreThan(0).required(),
        }),
      );

    case 'polynomial':
      return yupResolver(
        Yup.object().shape({
          algorithm: Yup.string().required(),
          livePreview: Yup.boolean().required(),
          degree: Yup.number().integer().min(1).max(6).required(),
        }),
      );

    case 'whittaker':
      return yupResolver(
        Yup.object().shape({
          lambda: Yup.number().integer().required(),
          maxIterations: Yup.number().integer().required(),
          learningRate: Yup.number().required(),
          tolerance: Yup.number().required(),
        }),
      );

    case 'cubic':
      return yupResolver(
        Yup.object().shape({
          noiseThreshold: Yup.number().required(),
          maxIterations: Yup.number().integer().required(),
          noisePercentile: Yup.number().integer().required(),
          noiseLevel: Yup.number().integer().required(),
          tolerance: Yup.number().required(),
        }),
      );

    case 'bernstein':
      return yupResolver(
        Yup.object().shape({
          maxIterations: Yup.number().integer().required(),
          tolerance: Yup.number().required(),
          factorStd: Yup.number().integer().required(),
          learningRate: Yup.number().required(),
          degree: Yup.number().integer().required(),
        }),
      );

    default:
      return yupResolver(Yup.object({ livePreview: Yup.boolean().required() }));
  }
}

export function getBaselineValues(
  algorithm: any,
  filterValues?: BaselineCorrectionOptions | null,
) {
  const { algorithm: baseAlgorithm, ...other } = filterValues || {};
  const overrides = baseAlgorithm === algorithm ? other : {};

  switch (algorithm) {
    case 'airpls':
      return {
        algorithm,
        livePreview: true,
        maxIterations: 100,
        tolerance: 0.001,
        ...overrides,
      };

    case 'polynomial':
      return {
        algorithm,
        livePreview: true,
        degree: 3,
        ...overrides,
      };

    case 'whittaker':
      return {
        algorithm,
        livePreview: true,
        lambda: 200,
        maxIterations: 20,
        learningRate: 0.2,
        tolerance: 1e-3,
        ...overrides,
      };

    case 'cubic':
      return {
        algorithm,
        livePreview: true,
        noiseThreshold: 1,
        maxIterations: 10,
        tolerance: 1e-6,
        noisePercentile: 10,
        noiseLevel: 1,
        ...overrides,

      };

    case 'bernstein':
      return {
        algorithm,
        livePreview: true,
        maxIterations: 100,
        tolerance: 1e-6,
        factorStd: 3,
        learningRate: 0.3,
        degree: 3,
        ...overrides,
      };

    default:
      return { livePreview: true };
  }
}


export function getBaselineData(
  algorithm: any,
  filterValues?: BaselineCorrectionOptions | null,
) {
  return {
    resolver: getBaselineResolver(algorithm),
    values: getBaselineValues(algorithm, filterValues),
  };
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
  const { syncFilterOptions, clearSyncFilterOptions } =
    useSyncedFilterOptions(syncWatch);

  const { resolver, values } = getBaselineData(algorithm?.value, filter?.value);

  const { handleSubmit, reset, ...otherFormOptions } =
    useForm<AlgorithmOptions>({
      defaultValues: values,
      resolver: resolver as any,
    });

  function syncWatch(sharedFilterOptions: any) {
    const { algorithm } = sharedFilterOptions;
    const algorithmItem = findAlgorithmItem(algorithm);
    if (algorithmItem) {
      onAlgorithmChange(algorithmItem);
    }
    reset({ ...values, ...sharedFilterOptions });
  }


  // const onChange = useCallback(
  //   (values: any) => {
  //     const { livePreview, ...options } = values;
  //     if (livePreview || previousPreviewRef !== livePreview) {
  //       // dispatch({
  //       //   type: 'CALCULATE_BASE_LINE_CORRECTION_FILTER',
  //       //   payload: {
  //       //     options,
  //       //     livePreview,
  //       //   },
  //       // });
  //     }
  //   },
  //   [dispatch],
  // );

  const handleApplyFilter = (
    values: any,
    triggerSource: 'apply' | 'onChange' = 'apply',
  ) => {

    const { livePreview, ...options } = values;
    switch (triggerSource) {
      case 'onChange': {
        // onChange(values);
        // console.log(values)
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
    void handleSubmit((values: any) => handleApplyFilter(values, 'onChange'))();
  }

  // useEffect(() => {
  //   void handleSubmit((values) => onChange(values))();
  // }, [handleSubmit]);

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
