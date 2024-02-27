import { NmrData2DFt } from 'cheminfo-types';
import { Spectrum2D } from 'nmr-load-save';
import { Filters } from 'nmr-processing';
import { CSSProperties, useCallback, useEffect, useRef, useState } from 'react';

import { stringCapitalize } from '../../utils/stringCapitalize';
import { useActivePhaseTraces } from '../2d/1d-tracer/phase-correction-traces/useActivePhaseTraces';
import { useDispatch } from '../context/DispatchContext';
import ActionButtons from '../elements/ActionButtons';
import Input, { InputStyle } from '../elements/Input';
import InputRange from '../elements/InputRange';
import Label from '../elements/Label';
import Select from '../elements/Select';
import { useFilter } from '../hooks/useFilter';
import useSpectrum from '../hooks/useSpectrum';
import { PhaseCorrectionTraceData, TraceDirection } from '../reducer/Reducer';

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
  const { activeTraceDirection, pivot } = useActivePhaseTraces();

  const { data } = useSpectrum(emptyData) as Spectrum2D;
  const filter = useFilter(Filters.phaseCorrectionTwoDimensions.id);

  const dispatch = useDispatch();
  const [value, setValue] = useState({ ph0: 0, ph1: 0 });
  const valueRef = useRef({ ph0: 0, ph1: 0 });

  const ph0Ref = useRef<any>();
  const ph1Ref = useRef<any>();

  useEffect(() => {
    if (filter) {
      const { value } = filter;
      const { ph0, ph1 } = value[
        activeTraceDirection
      ] as PhaseCorrectionTraceData;
      setValue({ ph0, ph1 });
      valueRef.current = { ph0, ph1 };
    }
    if (ph0Ref.current && ph1Ref.current) {
      if (filter) {
        const { value } = filter;
        const { ph0, ph1 } = value[
          activeTraceDirection
        ] as PhaseCorrectionTraceData;
        ph0Ref.current.setValue(ph0);
        ph1Ref.current.setValue(ph1);
      } else {
        ph0Ref.current.setValue(valueRef.current.ph0);
        ph1Ref.current.setValue(valueRef.current.ph1);
      }
    }
  }, [activeTraceDirection, filter]);

  const calcPhaseCorrectionHandler = useCallback(
    (newValues, filedName) => {
      if (filedName === 'ph1' && data && pivot) {
        const datum = (data as NmrData2DFt).rr;
        const nbPoints =
          activeTraceDirection === 'horizontal'
            ? datum.z[0].length
            : datum.z.length;
        const diff0 = newValues.ph0 - valueRef.current.ph0;
        const diff1 = newValues.ph1 - valueRef.current.ph1;
        newValues.ph0 += diff0 - (diff1 * (nbPoints - pivot?.index)) / nbPoints;
      }
      dispatch({
        type: 'CALCULATE_TOW_DIMENSIONS_MANUAL_PHASE_CORRECTION_FILTER',
        payload: newValues,
      });
    },
    [activeTraceDirection, data, dispatch, pivot],
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

  function handleApplyFilter() {
    dispatch({ type: 'APPLY_MANUAL_PHASE_CORRECTION_TOW_DIMENSION_FILTER' });
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
