import React, { useCallback, useState } from 'react';

import { useDispatch } from '../context/DispatchContext';
import {
  APPLY_MANUAL_PHASE_CORRECTION_FILTER,
  CALCULATE_MANUAL_PHASE_CORRECTION_FILTER,
  RESET_SELECTED_TOOL,
} from '../reducer/Actions';
import InputRange from '../elements/InputRange';

const styles = {
  container: {
    padding: '5px',
    height: '100%',
    display: 'flex',
  },
  input: {
    height: '100%',
    width: '100px',
    borderRadius: '5px',
    border: '0.55px solid #c7c7c7',
    margin: '0px 5px 0px 5px',
    textAlign: 'center',
  },
  actionButton: {
    height: '100%',
    width: '60px',
    borderRadius: '5px',
    border: '0.55px solid #c7c7c7',
    margin: '0px 5px',
    userSelect: 'none',
  },
  label: {
    lineHeight: 2,
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
      <span style={styles.label}>PH0: </span>
      <input
        name="ph0"
        style={styles.input}
        type="text"
        value={value.ph0}
        onChange={handleInput}
      />
      <span style={styles.label}>PH1: </span>
      <input
        name="ph1"
        style={styles.input}
        type="text"
        value={value.ph1}
        onChange={handleInput}
        // pattern="^\d*(\.\d{0,2})?$"
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
