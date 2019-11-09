import React, { useCallback, useState } from 'react';

import { useDispatch } from '../context/DispatchContext';
import {
  APPLY_MANUAL_PHASE_CORRECTION_FILTER,
  CALCULATE_MANUAL_PHASE_CORRECTION_FILTER,
} from '../reducer/Actions';

const styles = {
  container: {
    padding: '5px',
    height: '100%',
    display: 'flex',
  },
  input: {
    height: '100%',
    width: '50px',
    borderRadius: '5px',
    border: '0.55px solid #c7c7c7',
    margin: '0px 5px 0px 5px',
    textAlign: 'center',
  },
  applyButton: {
    height: '100%',
    width: '50px',
    borderRadius: '5px',
    border: '0.55px solid #c7c7c7',
  },
  label: {
    lineHeight: 2,
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
      if (e.target) {
        const _value = {
          ...value,
          [e.target.name]: e.target.validity.valid
            ? Number(e.target.value)
            : value[e.target.name],
        };
        setValue(_value);
      }
    },
    [value],
  );

  const handleInputChanged = useCallback(
    (e) => {
      const _value = {
        ...value,
        [e.target.name]: e.target.validity.valid
          ? Number(e.target.value)
          : value[e.target.name],
      };
      dispatch({
        type: CALCULATE_MANUAL_PHASE_CORRECTION_FILTER,
        value: _value,
      });
    },
    [dispatch, value],
  );

  return (
    <div style={styles.container}>
      <span style={styles.label}>PH0: </span>
      <input
        name="ph0"
        style={styles.input}
        type="number"
        value={value.ph0}
        onInput={handleInput}
        onChange={handleInputChanged}
        pattern="^\d*(\.\d{0,10})?$"
        step="0.5"
      />
      <span style={styles.label}>PH1: </span>
      <input
        name="ph1"
        style={styles.input}
        type="number"
        value={value.ph1}
        onInput={handleInput}
        onChange={handleInputChanged}
        pattern="^\d*(\.\d{0,2})?$"
        step="0.5"
      />
      <button
        type="button"
        style={styles.applyButton}
        onClick={handleApplyFilter}
      >
        Apply
      </button>
    </div>
  );
};

export default ManualPhaseCorrectionPanel;
