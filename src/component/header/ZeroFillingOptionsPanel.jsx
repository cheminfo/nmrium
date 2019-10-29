import React, { useState, useCallback, useReducer, useRef } from 'react';

import { APPLY_ZERO_FILLING_FILTER } from '../reducer/Actions';
import { useDispatch } from '../context/DispatchContext';
import Select from '../elements/Select';

const styles = {
  container: {
    padding: '5px',
    height: '100%',
    display: 'flex',
  },
  input: {
    height: '100%',
  },
  applyButton: {
    height: '100%',
    width: '50px',
  },
};

const ZeroFillingOptionsPanel = () => {
  const dispatch = useDispatch();
  const sizeTextInputRef = useRef();

  const handleApplyFilter = useCallback(() => {
    console.log(sizeTextInputRef.current.value);
    dispatch({
      type: APPLY_ZERO_FILLING_FILTER,
      value: sizeTextInputRef.current.value,
    });
  }, [dispatch]);

  return (
    <div style={styles.container}>
      <input ref={sizeTextInputRef} type="text" style={styles.input} />
      {/* <Select
        data={[{ key: 'sss', label: 'sss' }]}
        style={{ marginLeft: 10, marginRight: 10 }}
      /> */}
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

export default ZeroFillingOptionsPanel;
