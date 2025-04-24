import type { NmrData2DFt } from 'cheminfo-types';
import debounce from 'lodash/debounce.js';
import type { Filter2DEntry } from 'nmr-processing';
import type { Spectrum2D } from 'nmrium-core';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelect } from 'react-science/ui';

import { useActivePhaseTraces } from '../../../../2d/1d-tracer/phase-correction-traces/useActivePhaseTraces.js';
import { useDispatch } from '../../../../context/DispatchContext.js';
import { useSyncedFilterOptions } from '../../../../context/FilterSyncOptionsContext.js';
import useSpectrum from '../../../../hooks/useSpectrum.js';
import type { TraceDirection } from '../../../../reducer/Reducer.js';

type PhaseCorrectionTypes = 'manual' | 'automatic';

export interface AlgorithmItem {
  label: string;
  value: PhaseCorrectionTypes;
}

const defaultPhasingTypeItem: AlgorithmItem = {
  label: 'Manual',
  value: 'manual',
};
export const phaseCorrectionalAlgorithms: AlgorithmItem[] = [
  defaultPhasingTypeItem,
  {
    label: 'Automatic',
    value: 'automatic',
  },
];

const emptyData = { datum: {}, filter: null };

type PhaseOptions = Record<TraceDirection, { ph0: number; ph1: number }>;
const defaultPhaseOptions: PhaseOptions = {
  horizontal: { ph0: 0, ph1: 0 },
  vertical: { ph0: 0, ph1: 0 },
};

export function usePhaseCorrectionTwoDimensions(filter: Filter2DEntry | null) {
  const { activeTraceDirection, pivot, addTracesToBothDirections } =
    useActivePhaseTraces();

  const dispatch = useDispatch();
  const [value, setValue] = useState<PhaseOptions>(defaultPhaseOptions);
  const valueRef = useRef<PhaseOptions>(defaultPhaseOptions);

  const ph0Ref = useRef<any>();
  const ph1Ref = useRef<any>();

  const { data } = useSpectrum(emptyData) as Spectrum2D;
  const debounceCalculation = useRef(
    debounce((options) => {
      dispatch({
        type: 'CALCULATE_TOW_DIMENSIONS_MANUAL_PHASE_CORRECTION_FILTER',
        payload: { ...options, applyOn2D: true },
      });
    }, 250),
  );

  function syncWatch(sharedFilterOptions) {
    updateInputRangeInitialValue(sharedFilterOptions);
    setValue(sharedFilterOptions);
  }

  const { syncFilterOptions, clearSyncFilterOptions } =
    useSyncedFilterOptions(syncWatch);

  const {
    value: phaseCorrectionSelectItem,
    ...defaultPhaseCorrectionSelectProps
  } = useSelect<AlgorithmItem>({
    defaultSelectedItem: defaultPhasingTypeItem,
    itemTextKey: 'label',
  });

  useEffect(() => {
    if (filter && phaseCorrectionSelectItem?.value === 'manual') {
      const { value } = filter;
      const phaseOptions: PhaseOptions = defaultPhaseOptions;

      for (const direction of Object.keys(value)) {
        const { ph0, ph1 } = value[direction];
        phaseOptions[direction] = { ph0, ph1 };
      }

      setValue(phaseOptions);
      valueRef.current = phaseOptions;
    }
  }, [filter, phaseCorrectionSelectItem?.value]);

  useEffect(() => {
    if (ph0Ref.current && ph1Ref.current) {
      const { ph0, ph1 } = valueRef.current[activeTraceDirection];
      ph0Ref.current.setValue(ph0);
      ph1Ref.current.setValue(ph1);
    }
  }, [activeTraceDirection]);

  const calcPhaseCorrectionHandler = useCallback(
    (inputValue, filedName, source: 'input' | 'inputRange') => {
      const newValue = inputValue[activeTraceDirection];
      if (filedName === 'ph1' && data && pivot) {
        const datum = (data as NmrData2DFt).rr;
        const nbPoints =
          activeTraceDirection === 'horizontal'
            ? datum.z[0].length
            : datum.z.length;
        const { ph0, ph1 } = valueRef.current[activeTraceDirection];
        const diff0 = newValue.ph0 - ph0;
        const diff1 = newValue.ph1 - ph1;
        newValue.ph0 += diff0 - (diff1 * (nbPoints - pivot?.index)) / nbPoints;
      }

      dispatch({
        type: 'CALCULATE_TOW_DIMENSIONS_MANUAL_PHASE_CORRECTION_FILTER',
        payload: { ...newValue, applyOn2D: source === 'input' },
      });

      if (source === 'inputRange') {
        debounceCalculation.current(newValue);
      }
    },
    [activeTraceDirection, data, dispatch, pivot],
  );

  const updateInputRangeInitialValue = useCallback(
    (value) => {
      // update InputRange initial value
      const { ph0, ph1 } = value[activeTraceDirection];
      ph0Ref.current?.setValue(ph0);
      ph1Ref.current?.setValue(ph1);
    },
    [activeTraceDirection],
  );

  const handleInputValueChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      if (e.target) {
        const newValue = {
          ...valueRef.current,
          [activeTraceDirection]: {
            ...valueRef.current[activeTraceDirection],
            [name]: Number(value),
          },
        };

        if (String(value).trim() !== '-') {
          calcPhaseCorrectionHandler(newValue, name, 'input');
        }
        updateInputRangeInitialValue(newValue);
        valueRef.current = newValue;
        setValue(valueRef.current);
        syncFilterOptions(valueRef.current);
      }
    },
    [
      activeTraceDirection,
      calcPhaseCorrectionHandler,
      syncFilterOptions,
      updateInputRangeInitialValue,
    ],
  );

  const handleRangeChange = useCallback(
    (e) => {
      const newValue = {
        ...valueRef.current,
        [activeTraceDirection]: {
          ...valueRef.current[activeTraceDirection],
          [e.name]: e.value,
        },
      };
      calcPhaseCorrectionHandler(newValue, e.name, 'inputRange');
      updateInputRangeInitialValue(newValue);
      valueRef.current = newValue;
      setValue(valueRef.current);
      syncFilterOptions(valueRef.current);
    },
    [
      activeTraceDirection,
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

  function onChangeHandler(direction: TraceDirection) {
    dispatch({
      type: 'CHANGE_PHASE_CORRECTION_DIRECTION',
      payload: { direction },
    });
  }

  function handleApplyFilter() {
    switch (phaseCorrectionSelectItem?.value) {
      case 'automatic': {
        dispatch({
          type: 'APPLY_AUTO_PHASE_CORRECTION_TOW_DIMENSION_FILTER',
        });
        break;
      }

      case 'manual': {
        dispatch({
          type: 'APPLY_MANUAL_PHASE_CORRECTION_TOW_DIMENSION_FILTER',
        });
        break;
      }
      default:
        break;
    }

    clearSyncFilterOptions();
  }

  function handleToggleAddTraceToBothDirections() {
    dispatch({ type: 'TOGGLE_ADD_PHASE_CORRECTION_TRACE_TO_BOTH_DIRECTIONS' });
  }

  return {
    handleCancelFilter,
    onChangeHandler,
    handleApplyFilter,
    handleToggleAddTraceToBothDirections,
    handleRangeChange,
    handleInputValueChange,
    value,
    addTracesToBothDirections,
    defaultPhaseCorrectionSelectProps,
    phaseCorrectionSelectItem,
    activeTraceDirection,
    ph0Ref,
    ph1Ref,
  };
}
