import { FormGroup } from '@blueprintjs/core';
import { Select } from '@blueprintjs/select';
import { Spectrum1D } from 'nmr-load-save';
import { Filters } from 'nmr-processing';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, useSelect } from 'react-science/ui';

import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import ActionButtons from '../elements/ActionButtons';
import InputRange from '../elements/InputRange';
import { NumberInput2 } from '../elements/NumberInput2';
import { useFilter } from '../hooks/useFilter';
import useSpectrum from '../hooks/useSpectrum';

import { HeaderContainer } from './HeaderContainer';

type PhaseCorrectionTypes = 'manual' | 'automatic' | 'absolute';

interface AlgorithmItem {
  label: string;
  value: PhaseCorrectionTypes;
}

const defaultPhasingTypeItem: AlgorithmItem = {
  label: 'Manual',
  value: 'manual',
};

const algorithms: AlgorithmItem[] = [
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

export default function PhaseCorrectionPanel() {
  const {
    toolOptions: {
      data: { pivot },
    },
  } = useChartData();

  const { data } = useSpectrum(emptyData) as Spectrum1D;

  const filter = useFilter(Filters.phaseCorrection.id);

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

  useEffect(() => {
    if (filter && phaseCorrectionTypeItem?.value === 'manual') {
      valueRef.current = filter.value;
      setValue(filter.value);
    }

    if (ph0Ref.current && ph1Ref.current) {
      if (filter) {
        ph0Ref.current.setValue(filter.value.ph0);
        ph1Ref.current.setValue(filter.value.ph1);
      } else {
        ph0Ref.current.setValue(valueRef.current.ph0);
        ph1Ref.current.setValue(valueRef.current.ph1);
      }
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
    ph0Ref.current.setValue(value.ph0);
    ph1Ref.current.setValue(value.ph1);
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
    },
    [calcPhaseCorrectionHandler, updateInputRangeInitialValue],
  );

  const handleRangeChange = useCallback(
    (e) => {
      const newValue = { ...valueRef.current, [e.name]: e.value };
      calcPhaseCorrectionHandler(newValue, e.name);
      updateInputRangeInitialValue(newValue);
      valueRef.current = newValue;
      setValue(valueRef.current);
    },
    [calcPhaseCorrectionHandler, updateInputRangeInitialValue],
  );

  function handleCancelFilter() {
    dispatch({
      type: 'RESET_SELECTED_TOOL',
    });
  }

  return (
    <HeaderContainer>
      <div style={{ padding: '0 5px' }}>
        <Select<AlgorithmItem>
          items={algorithms}
          filterable={false}
          itemsEqual="value"
          {...defaultSelectProps}
        >
          <Button
            text={phaseCorrectionTypeItem?.label}
            rightIcon="double-caret-vertical"
          />
        </Select>
      </div>
      {phaseCorrectionTypeItem?.value === 'manual' && (
        <>
          <FormGroup
            label="PH0:"
            inline
            style={{ paddingLeft: '5px', margin: 0 }}
          >
            <NumberInput2
              name="ph0"
              onValueChange={handleInput}
              value={value.ph0}
              debounceTime={250}
              style={{ width: 50 }}
            />
          </FormGroup>
          <FormGroup
            label="PH1:"
            inline
            style={{ paddingLeft: '5px', margin: 0 }}
          >
            <NumberInput2
              name="ph1"
              onValueChange={handleInput}
              value={value.ph1}
              debounceTime={250}
              style={{ width: 50 }}
            />
          </FormGroup>
          <InputRange
            ref={ph0Ref}
            name="ph0"
            label="Change PH0 (click and drag)"
            shortLabel="Ph0"
            style={{ width: '20%' }}
            onChange={handleRangeChange}
          />
          <InputRange
            ref={ph1Ref}
            name="ph1"
            label="Change PH1 (click and drag)"
            shortLabel="Ph1"
            style={{ width: '20%' }}
            onChange={handleRangeChange}
          />
        </>
      )}

      <ActionButtons onDone={handleApplyFilter} onCancel={handleCancelFilter} />
    </HeaderContainer>
  );
}
