import { Spectrum1D } from 'nmr-load-save';
import { Filter } from 'nmr-processing';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelect } from 'react-science/ui';

import { useChartData } from '../../../context/ChartContext';
import { useDispatch } from '../../../context/DispatchContext';
import useSpectrum from '../../../hooks/useSpectrum';

import { useSyncedFilterOptions } from './useSyncedFilterOptions';

type PhaseCorrectionTypes = 'manual' | 'automatic' | 'absolute';

export interface AlgorithmItem {
  label: string;
  value: PhaseCorrectionTypes;
}

const defaultPhasingTypeItem: AlgorithmItem = {
  label: 'Manual',
  value: 'manual',
};

export const algorithms: AlgorithmItem[] = [
  defaultPhasingTypeItem,
  {
    label: 'Automatic',
    value: 'automatic',
  },
  {
    label: 'Convert to absolute spectrum',
    value: 'absolute',
  },
];
const emptyData = { datum: {}, filter: null };

export function usePhaseCorrection(filter: Filter | null) {
  const {
    toolOptions: {
      data: { pivot },
    },
  } = useChartData();

  const { data } = useSpectrum(emptyData) as Spectrum1D;
  const dispatch = useDispatch();
  const [value, setValue] = useState({ ph0: 0, ph1: 0 });
  const valueRef = useRef({ ph0: 0, ph1: 0 });

  const ph0Ref = useRef<any>();
  const ph1Ref = useRef<any>();
  const { value: phaseCorrectionTypeItem, ...defaultSelectProps } =
    useSelect<AlgorithmItem>({
      defaultSelectedItem: defaultPhasingTypeItem,
      itemTextKey: 'label',
    });

  function syncWatch(sharedFilterOptions) {
    updateInputRangeInitialValue(sharedFilterOptions);
    setValue(sharedFilterOptions);
  }

  const { syncFilterOptions, clearSyncFilterOptions } =
    useSyncedFilterOptions(syncWatch);

  useEffect(() => {
    if (filter && phaseCorrectionTypeItem?.value === 'manual') {
      const { ph0 = 0, ph1 = 0 } = filter?.value || {};
      valueRef.current = { ph0, ph1 };
      setValue(valueRef.current);
    }

    if (filter) {
      ph0Ref.current?.setValue(filter?.value?.ph0 || 0);
      ph1Ref.current?.setValue(filter?.value?.ph1 || 0);
    } else {
      ph0Ref.current?.setValue(valueRef.current?.ph0 || 0);
      ph1Ref.current?.setValue(valueRef.current?.ph1 || 0);
    }
  }, [filter, phaseCorrectionTypeItem]);

  function handleApplyFilter() {
    switch (phaseCorrectionTypeItem?.value) {
      case 'automatic': {
        dispatch({
          type: 'APPLY_AUTO_PHASE_CORRECTION_FILTER',
        });
        break;
      }

      case 'manual': {
        dispatch({
          type: 'APPLY_MANUAL_PHASE_CORRECTION_FILTER',
          payload: value,
        });
        break;
      }
      case 'absolute': {
        dispatch({
          type: 'APPLY_ABSOLUTE_FILTER',
        });
        break;
      }
      default:
        break;
    }
    clearSyncFilterOptions();
  }

  const calcPhaseCorrectionHandler = useCallback(
    (newValues, filedName) => {
      if (filedName === 'ph1' && data.re) {
        const diff0 = newValues.ph0 - valueRef.current.ph0;
        const diff1 = newValues.ph1 - valueRef.current.ph1;
        newValues.ph0 +=
          diff0 - (diff1 * (data.re.length - pivot?.index)) / data.re.length;
      }
      dispatch({
        type: 'CALCULATE_MANUAL_PHASE_CORRECTION_FILTER',
        payload: newValues,
      });
    },
    [data.re, dispatch, pivot?.index],
  );

  const updateInputRangeInitialValue = useCallback((value) => {
    // update InputRange initial value
    ph0Ref.current?.setValue(value.ph0);
    ph1Ref.current?.setValue(value.ph1);
  }, []);

  const handleInput = useCallback(
    (valueAsNumber, valueAsString, element) => {
      const { name } = element;

      if (Number.isNaN(valueAsNumber)) return;

      const newValue = { ...valueRef.current, [name]: Number(valueAsNumber) };

      calcPhaseCorrectionHandler(newValue, name);

      updateInputRangeInitialValue(newValue);
      valueRef.current = newValue;
      setValue(valueRef.current);
      syncFilterOptions(valueRef.current);
    },
    [
      calcPhaseCorrectionHandler,
      syncFilterOptions,
      updateInputRangeInitialValue,
    ],
  );

  const handleRangeChange = useCallback(
    (e) => {
      const newValue = { ...valueRef.current, [e.name]: e.value };
      calcPhaseCorrectionHandler(newValue, e.name);
      updateInputRangeInitialValue(newValue);
      valueRef.current = newValue;
      setValue(valueRef.current);
      syncFilterOptions(valueRef.current);
    },
    [
      calcPhaseCorrectionHandler,
      syncFilterOptions,
      updateInputRangeInitialValue,
    ],
  );

  function handleCancelFilter() {
    dispatch({
      type: 'RESET_SELECTED_TOOL',
    });
    clearSyncFilterOptions();
  }

  return {
    handleApplyFilter,
    handleCancelFilter,
    handleRangeChange,
    handleInput,
    defaultSelectProps,
    phaseCorrectionTypeItem,
    ph0Ref,
    ph1Ref,
    value,
  };
}
