import React, { useCallback } from 'react';

import { APPLY_FFT_FILTER } from '../reducer/Actions';
import { useDispatch } from '../context/DispatchContext';

const styles = {
  container: {
    padding: '5px',
    height: '100%',
    display: 'flex',
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

const FFTOptionsPanel = () => {
  const dispatch = useDispatch();

  const handleApplyFilter = useCallback(() => {
    dispatch({
      type: APPLY_FFT_FILTER,
      value: '',
    });
  }, [dispatch]);

  return (
    <div style={styles.container}>
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

export default FFTOptionsPanel;
