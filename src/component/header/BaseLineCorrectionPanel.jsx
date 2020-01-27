import React, { useCallback } from 'react';

import {
  RESET_SELECTED_TOOL,
  APPLY_BASE_LINE_CORRECTION_FILTER,
} from '../reducer/Actions';
import { useDispatch } from '../context/DispatchContext';

const styles = {
  container: {
    padding: '5px',
    height: '100%',
    display: 'flex',
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

const BaseLineCorrectionPanel = () => {
  const dispatch = useDispatch();

  const handleApplyFilter = useCallback(() => {
    dispatch({
      type: APPLY_BASE_LINE_CORRECTION_FILTER,
    });
  }, [dispatch]);

  const handleCancelFilter = useCallback(() => {
    dispatch({
      type: RESET_SELECTED_TOOL,
    });
  }, [dispatch]);

  return (
    <div style={styles.container}>
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

export default BaseLineCorrectionPanel;
