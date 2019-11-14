import React, { useCallback } from 'react';

import { useDispatch } from '../context/DispatchContext';
import { AUTO_RANGES_PICKING } from '../reducer/Actions';

const styles = {
  container: {
    padding: '5px',
    height: '100%',
    display: 'flex',
    fontSize: '12px',
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

const AutoRangesPickingOptionPanel = () => {
  const dispatch = useDispatch();

  const handleApplyFilter = useCallback(() => {
    dispatch({
      type: AUTO_RANGES_PICKING,
    });
  }, [dispatch]);

  const handleCancelFilter = useCallback(() => {}, []);

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

export default AutoRangesPickingOptionPanel;
