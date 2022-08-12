import { CSSProperties, useCallback, useEffect, useRef, useState } from 'react';

import * as Filters from '../../data/Filters';
import { Datum1D } from '../../data/types/data1d';
import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import ActionButtons from '../elements/ActionButtons';
import Input from '../elements/Input';
import InputRange from '../elements/InputRange';
import Label from '../elements/Label';
import Select from '../elements/Select';
import { useFilter } from '../hooks/useFilter';
import useSpectrum from '../hooks/useSpectrum';
import {
  APPLY_MANUAL_PHASE_CORRECTION_FILTER,
  APPLY_AUTO_PHASE_CORRECTION_FILTER,
  CALCULATE_MANUAL_PHASE_CORRECTION_FILTER,
  RESET_SELECTED_TOOL,
  APPLY_ABSOLUTE_FILTER,
} from '../reducer/types/Types';

import { HeaderContainer } from './HeaderContainer';

const selectStyle: CSSProperties = {
  marginLeft: '5px',
  marginRight: '10px',
  border: 'none',
  height: '20px',
};

const inputStyle = {
  input: {
    width: '100px',
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

export default function ManualPhaseCorrectionPanel() {
  const {
    toolOptions: {
      data: { pivot },
    },
  } = useChartData();

  const { data } = useSpectrum(emptyData) as Datum1D;

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
    if (filter) {
      valueRef.current = filter.value;
      setValue(filter.value);
      ph0Ref.current.setValue(filter.value.ph0);
      ph1Ref.current.setValue(filter.value.ph1);
    } else {
      ph0Ref.current.setValue(valueRef.current.ph0);
      ph1Ref.current.setValue(valueRef.current.ph1);
    }
  }, [filter]);

  const handleApplyFilter = useCallback(() => {
    switch (phaseCorrectionType) {
      case phaseCorrectionTypes.automatic: {
        dispatch({
          type: APPLY_AUTO_PHASE_CORRECTION_FILTER,
        });
        break;
      }

      case phaseCorrectionTypes.manual: {
        dispatch({
          type: APPLY_MANUAL_PHASE_CORRECTION_FILTER,
          value,
        });
        break;
      }
      case phaseCorrectionTypes.absolute: {
        dispatch({
          type: APPLY_ABSOLUTE_FILTER,
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
        newValues.ph0 += diff0 - (diff1 * pivot?.index) / data.re.length;
      }

      dispatch({
        type: CALCULATE_MANUAL_PHASE_CORRECTION_FILTER,
        value: newValues,
      });
    },
    [data.re, dispatch, pivot?.index],
  );

  const handleInput = useCallback(
    (e) => {
      const { name, value } = e.target;
      if (e.target) {
        const newValue = { ...valueRef.current, [name]: value };

        if (String(value).trim() !== '-') {
          calcPhaseCorrectionHandler(newValue, name);
        }

        // update InputRange initial value
        switch (name) {
          case 'ph0':
            ph0Ref.current.setValue(newValue.ph0);
            break;
          case 'ph1':
            ph1Ref.current.setValue(newValue.ph1);
            break;
          default:
            break;
        }

        valueRef.current = newValue;
        setValue(valueRef.current);
      }
    },
    [calcPhaseCorrectionHandler],
  );

  const handleRangeChange = useCallback(
    (e) => {
      const newValue = { ...valueRef.current, [e.name]: e.value };
      calcPhaseCorrectionHandler(newValue, e.name);
      valueRef.current = newValue;
      setValue(valueRef.current);
    },
    [calcPhaseCorrectionHandler],
  );

  const handleCancelFilter = useCallback(() => {
    dispatch({
      type: RESET_SELECTED_TOOL,
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
          <Label title="PH0 :" style={{ wrapper: { marginRight: '5px' } }}>
            <Input
              name="ph0"
              style={inputStyle}
              onChange={handleInput}
              value={value.ph0}
              type="number"
              debounceTime={250}
            />
          </Label>
          <Label title="PH1 :">
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
            label="Change Ph0 By mouse click and drag"
            style={{ width: '20%' }}
            onChange={handleRangeChange}
          />
          <InputRange
            ref={ph1Ref}
            name="ph1"
            label="Change Ph1 By mouse click and drag"
            style={{ width: '20%' }}
            onChange={handleRangeChange}
          />
        </>
      )}

      <ActionButtons onDone={handleApplyFilter} onCancel={handleCancelFilter} />
    </HeaderContainer>
  );
}
