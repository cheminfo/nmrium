import React, { useCallback, useState } from 'react';

import { useDispatch } from '../context/DispatchContext';
import {
  APPLY_MANUAL_PHASE_CORRECTION_FILTER,
  CALCULATE_MANUAL_PHASE_CORRECTION_FILTER,
  RESET_SELECTED_TOOL,
} from '../reducer/types/Types';
import InputRange from '../elements/InputRange';
import TextInput from '../elements/TextInput';

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
};

const ManualPhaseCorrectionPanel = () => {
  const dispatch = useDispatch();
  const [value, setValue] = useState({ ph0: 0, ph1: 0, pivotIndex: 1 });

  const handleApplyFilter = useCallback(() => {
    dispatch({
      type: APPLY_MANUAL_PHASE_CORRECTION_FILTER,
      value: value,
    });
  }, [dispatch, value]);

  const handleInput = useCallback(
    (e) => {
      const fieldName = e.target.name;
      if (e.target) {
        const inputValue =
          parseFloat(e.target.value) || e.target.value.trim() === '-'
            ? e.target.value
            : 0;

        setValue((prevValue) => {
          const _value = {
            ...prevValue,
            [fieldName]: inputValue,
          };

          if (inputValue !== '-') {
            const newValue = {
              ...value,
              [fieldName]: inputValue - prevValue[fieldName],
            };
            for (let key in prevValue) {
              if (prevValue[key] === newValue[key]) {
                newValue[key] -= prevValue[key];
              }
            }
            dispatch({
              type: CALCULATE_MANUAL_PHASE_CORRECTION_FILTER,
              value: newValue,
            });
          }

          return _value;
        });
      }
    },
    [dispatch, value],
  );

  const handleRangeChange = useCallback(
    (e) => {
      const _value = { ...value, [e.name]: e.value };
      let diff = {};
      for (let key in value) {
        diff[key] = _value[key] - value[key];
      }
      dispatch({
        type: CALCULATE_MANUAL_PHASE_CORRECTION_FILTER,
        value: diff,
      });
      setValue(_value);
    },
    [dispatch, value],
  );

  const handleCancelFilter = useCallback(() => {
    dispatch({
      type: RESET_SELECTED_TOOL,
    });
  }, [dispatch]);

  return (
    <div style={styles.container}>
      <TextInput
        label="PH0:"
        name="ph0"
        style={{ input: styles.input }}
        onChange={handleInput}
        value={value.ph0}
      />
      <TextInput
        label="PH1:"
        name="ph1"
        style={{ input: styles.input }}
        onChange={handleInput}
        value={value.ph1}
      />

      <InputRange
        name="ph0"
        value={value.ph0}
        label="Change Ph0 By mouse click and drag"
        style={{ width: '20%' }}
        onChange={handleRangeChange}
      />
      <InputRange
        name="ph1"
        value={value.ph1}
        label="Change Ph1 By mouse click and drag"
        style={{ width: '20%' }}
        onChange={handleRangeChange}
      />

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
    </div>
  );
};

export default ManualPhaseCorrectionPanel;
