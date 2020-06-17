import React, { useCallback } from 'react';

import { useDispatch } from '../context/DispatchContext';
import { RESET_SELECTED_TOOL } from '../reducer/types/Types';

const styles = {
  container: {
    padding: '5px',
    height: '100%',
    display: 'flex',
    fontSize: '12px',
  },
  input: {
    width: '50px',
  },
  inputContainer: {
    flex: '2',
  },
  label: {
    flex: '5',
  },
  actionButton: {
    height: '100%',
    borderRadius: '5px',
    border: '0.55px solid #c7c7c7',
    margin: '0px 5px',
    userSelect: 'none',
  },
};

const Zones2DOptionPanel = () => {
  const dispatch = useDispatch();

  const handleApplyFilter = useCallback(() => {
    // eslint-disable-next-line no-console
    console.log('auto');
  }, []);

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
        Auto Zones Picking
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

export default Zones2DOptionPanel;
