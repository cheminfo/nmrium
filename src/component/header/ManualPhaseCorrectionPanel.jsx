import { memo, useCallback, useEffect, useRef, useState } from 'react';

import { useDispatch } from '../context/DispatchContext';
import Input from '../elements/Input';
import InputRange from '../elements/InputRange';
import Select from '../elements/Select';
import ManualPhaseCorrectionWrapper from '../hoc/ManualPhaseCorrectionWrapper';
import {
  APPLY_MANUAL_PHASE_CORRECTION_FILTER,
  APPLY_AUTO_PHASE_CORRECTION_FILTER,
  CALCULATE_MANUAL_PHASE_CORRECTION_FILTER,
  RESET_SELECTED_TOOL,
  APPLY_ABSOLUTE_FILTER,
} from '../reducer/types/Types';

const styles = {
  container: {
    padding: '5px',
    height: '100%',
    display: 'flex',
  },
  input: {
    width: '100px',
  },
  actionButton: {
    height: '100%',
    width: '60px',
    borderRadius: '5px',
    border: '0.55px solid #c7c7c7',
    margin: '0px 5px',
    userSelect: 'none',
  },
  select: {
    marginLeft: '5px',
    marginRight: '10px',
    border: 'none',
    height: '20px',
  },
};

const phaseCorrectionTypes = {
  manual: 'manual',
  automatic: 'automatic',
  absolute: 'absolute',
};

const algorithms = [
  {
    key: phaseCorrectionTypes.manual,
    label: 'Manual',
    value: phaseCorrectionTypes.manual,
  },
  {
    key: phaseCorrectionTypes.automatic,
    label: 'Automatic',
    value: phaseCorrectionTypes.automatic,
  },
  {
    key: phaseCorrectionTypes.absolute,
    label: 'Absolute',
    value: phaseCorrectionTypes.absolute,
  },
];

function ManualPhaseCorrectionPanel({ datum, pivot, filter }) {
  const dispatch = useDispatch();
  const [value, setValue] = useState({ ph0: 0, ph1: 0 });
  const valueRef = useRef({ ph0: 0, ph1: 0 });

  const ph0Ref = useRef();
  const ph1Ref = useRef();

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
        const newValue = { ...value };
        newValue.ph0 =
          newValue.ph0 - (newValue.ph1 * pivot.index) / datum.y.length;

        dispatch({
          type: APPLY_MANUAL_PHASE_CORRECTION_FILTER,
          value: newValue,
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
  }, [datum.y.length, dispatch, phaseCorrectionType, pivot.index, value]);

  const calcPhaseCorrectionHandler = useCallback(
    (newValues, filedName) => {
      const diff = { ...newValues };

      for (const key in valueRef.current) {
        diff[key] = newValues[key] - valueRef.current[key];
      }

      if (filedName === 'ph1') {
        diff.ph0 = diff.ph0 - (diff.ph1 * pivot.index) / datum.y.length;
      }

      dispatch({
        type: CALCULATE_MANUAL_PHASE_CORRECTION_FILTER,
        value: diff,
      });
    },
    [datum.y.length, dispatch, pivot.index],
  );

  const handleInput = useCallback(
    (e) => {
      const { name, value } = e.target;
      if (e.target) {
        const newValue = { ...valueRef.current, [name]: value };
        if (value.trim() !== '-') {
          calcPhaseCorrectionHandler(newValue, name);
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
    <div style={styles.container}>
      <Select
        onChange={onChangeHandler}
        data={algorithms}
        value={phaseCorrectionTypes.manual}
        style={styles.select}
      />

      {phaseCorrectionType === phaseCorrectionTypes.manual && (
        <>
          <Input
            label="PH0:"
            name="ph0"
            style={{ input: styles.input }}
            onChange={handleInput}
            value={value.ph0}
            type="number"
          />
          <Input
            label="PH1:"
            name="ph1"
            style={{ input: styles.input }}
            onChange={handleInput}
            value={value.ph1}
            type="number"
          />

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

      <button
        type="button"
        style={styles.actionButton}
        onClick={handleApplyFilter}
      >
        Apply
      </button>
      <button
        type="button"
        style={styles.actionButton}
        onClick={handleCancelFilter}
      >
        Cancel
      </button>
      {/* <button
        type="button"
        style={styles.actionButton}
        onClick={handleAutoFilter}
      >
        Auto
      </button> */}
    </div>
  );
}

export default ManualPhaseCorrectionWrapper(memo(ManualPhaseCorrectionPanel));
