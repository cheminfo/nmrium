import { Spectrum1D } from 'nmr-load-save';
import { Filters } from 'nmr-processing';
import { CSSProperties, useCallback, useEffect, useRef, useState } from 'react';

import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import ActionButtons from '../elements/ActionButtons';
import Input, { InputStyle } from '../elements/Input';
import InputRange from '../elements/InputRange';
import Label from '../elements/Label';
import Select from '../elements/Select';
import { useFilter } from '../hooks/useFilter';
import useSpectrum from '../hooks/useSpectrum';

import { headerLabelStyle } from './Header';
import { HeaderContainer } from './HeaderContainer';

const selectStyle: CSSProperties = {
  marginLeft: '5px',
  marginRight: '10px',
  border: 'none',
  height: '20px',
};

const inputStyle: InputStyle = {
  input: {
    width: '70px',
    textAlign: 'center',
  },
  inputWrapper: {
    height: '100%',
  },
};

const phaseCorrectionTypes = {
  manual: 'manual',
  automatic: 'automatic',
  absolute: 'absolute',
};

const algorithms = [
  {
    label: 'Manual',
    value: phaseCorrectionTypes.manual,
  },
  {
    label: 'Automatic',
    value: phaseCorrectionTypes.automatic,
  },
  {
    label: 'Absolute',
    value: phaseCorrectionTypes.absolute,
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

  const [phaseCorrectionType, setPhaseCorrectionType] = useState(
    phaseCorrectionTypes.manual,
  );

  useEffect(() => {
    if (filter && phaseCorrectionType === phaseCorrectionTypes.manual) {
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
  }, [filter, phaseCorrectionType]);

  const handleApplyFilter = useCallback(() => {
    switch (phaseCorrectionType) {
      case phaseCorrectionTypes.automatic: {
        dispatch({
          type: 'APPLY_AUTO_PHASE_CORRECTION_FILTER',
        });
        break;
      }

      case phaseCorrectionTypes.manual: {
        dispatch({
          type: 'APPLY_MANUAL_PHASE_CORRECTION_FILTER',
          payload: value,
        });
        break;
      }
      case phaseCorrectionTypes.absolute: {
        dispatch({
          type: 'APPLY_ABSOLUTE_FILTER',
        });
        break;
      }
      default:
        break;
    }
  }, [dispatch, phaseCorrectionType, value]);

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
    (e) => {
      const { name, value } = e.target;
      if (e.target) {
        const newValue = { ...valueRef.current, [name]: Number(value) };

        if (String(value).trim() !== '-') {
          calcPhaseCorrectionHandler(newValue, name);
        }
        updateInputRangeInitialValue(newValue);
        valueRef.current = newValue;
        setValue(valueRef.current);
      }
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

  const handleCancelFilter = useCallback(() => {
    dispatch({
      type: 'RESET_SELECTED_TOOL',
    });
  }, [dispatch]);

  const onChangeHandler = useCallback((val) => {
    setPhaseCorrectionType(val);
  }, []);

  return (
    <HeaderContainer>
      <Select
        onChange={onChangeHandler}
        items={algorithms}
        defaultValue={phaseCorrectionTypes.manual}
        style={selectStyle}
      />

      {phaseCorrectionType === phaseCorrectionTypes.manual && (
        <>
          <Label title="PH0 :" style={headerLabelStyle}>
            <Input
              name="ph0"
              style={inputStyle}
              onChange={handleInput}
              value={value.ph0}
              type="number"
              debounceTime={250}
            />
          </Label>
          <Label title="PH1 :" style={headerLabelStyle}>
            <Input
              name="ph1"
              style={inputStyle}
              onChange={handleInput}
              value={value.ph1}
              type="number"
              debounceTime={250}
            />
          </Label>
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
