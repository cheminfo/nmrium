import { Spectrum1D } from 'nmr-load-save';
import {
  CSSProperties,
  useCallback,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
} from 'react';

import { stringCapitalize } from '../../utils/stringCapitalize';
import { useActivePhaseTraces } from '../2d/1d-tracer/phase-correction-traces/useActivePhaseTraces';
import { useDispatch } from '../context/DispatchContext';
import ActionButtons from '../elements/ActionButtons';
import Input, { InputStyle } from '../elements/Input';
import InputRange from '../elements/InputRange';
import Label from '../elements/Label';
import Select from '../elements/Select';
import useSpectrum from '../hooks/useSpectrum';
import { TraceDirection } from '../reducer/Reducer';

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

const TRACE_DIRECTIONS: Array<{ label: string; value: TraceDirection }> = (
  ['horizontal', 'vertical'] as TraceDirection[]
).map((key) => ({
  label: stringCapitalize(key),
  value: key,
}));

const emptyData = { datum: {}, filter: null };

export default function PhaseCorrectionTwoDimensionsPanel() {
  const { ph0, ph1, pivot, activeTraceDirection } = useActivePhaseTraces();

  const { data } = useSpectrum(emptyData) as Spectrum1D;
  const activeDirection = useDeferredValue(activeTraceDirection);

  const dispatch = useDispatch();
  const [value, setValue] = useState({ ph0: 0, ph1: 0 });
  const valueRef = useRef({ ph0: 0, ph1: 0 });

  const ph0Ref = useRef<any>();
  const ph1Ref = useRef<any>();

  useEffect(() => {
    if (activeDirection !== activeTraceDirection) {
      setValue({ ph0, ph1 });
      valueRef.current = { ph0, ph1 };
    }
  }, [activeDirection, activeTraceDirection, ph0, ph1]);

  const calcPhaseCorrectionHandler = useCallback(
    (newValues, filedName) => {
      if (filedName === 'ph1' && data.re && pivot) {
        const diff0 = newValues.ph0 - valueRef.current.ph0;
        const diff1 = newValues.ph1 - valueRef.current.ph1;
        newValues.ph0 +=
          diff0 - (diff1 * (data.re.length - pivot?.index)) / data.re.length;
      }
      dispatch({
        type: 'CALCULATE_TOW_DIMENSIONS_MANUAL_PHASE_CORRECTION_FILTER',
        payload: newValues,
      });
    },
    [data.re, dispatch, pivot],
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

  function onChangeHandler(direction) {
    dispatch({
      type: 'CHANGE_PHASE_CORRECTION_DIRECTION',
      payload: { direction },
    });
  }

  /*eslint-disable unicorn/consistent-function-scoping */
  function handleApplyFilter() {
    //TODO implement apply filter
  }

  return (
    <HeaderContainer>
      <Select
        onChange={onChangeHandler}
        items={TRACE_DIRECTIONS}
        defaultValue={activeTraceDirection}
        style={selectStyle}
      />

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

      <ActionButtons onDone={handleApplyFilter} onCancel={handleCancelFilter} />
    </HeaderContainer>
  );
}
