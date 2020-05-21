import React, { useCallback } from 'react';

import { useDispatch } from '../context/DispatchContext';
import {
  AUTO_RANGES_DETECTION,
  RESET_SELECTED_TOOL,
} from '../reducer/types/Types';

const styles = {
  container: {
    padding: '5px',
    height: '100%',
    display: 'flex',
    fontSize: '12px',
    alignItems: 'baseline',
  },
  input: {
    height: '100%',
    width: '50px',
    borderRadius: '5px',
    border: '0.55px solid #c7c7c7',
    margin: '0px 5px 0px 5px',
    textAlign: 'center',
  },
  actionButton: {
    height: '100%',
    minWidth: '60px',
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

const RangesPickingOptionPanel = () => {
  const dispatch = useDispatch();

  const handleApplyFilter = useCallback(() => {
    dispatch({
      type: AUTO_RANGES_DETECTION,
      options: {
        minMaxRatio: 0.05,
        nH: 100,
        compile: true,
        frequencyCluster: 3,
        clean: true,
        keepPeaks: true,
      },
    });
  }, [dispatch]);

  const handleCancelFilter = useCallback(() => {
    dispatch({
      type: RESET_SELECTED_TOOL,
    });
  }, [dispatch]);

  return (
    <div style={styles.container}>
      <span style={styles.label}>
        Manual selection using SHIFT + select zone or click on Auto peak picking
      </span>
      <button
        type="button"
        style={styles.actionButton}
        onClick={handleApplyFilter}
      >
        Auto peak picking
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

export default RangesPickingOptionPanel;
