import React, { useCallback, useRef } from 'react';

import { useDispatch } from '../context/DispatchContext';
import { AUTO_PEAK_PICKING } from '../reducer/Actions';

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

const AutoPeakPickingOptionPanel = () => {
  const dispatch = useDispatch();
  const minMaxRatioRef = useRef();
  const maxNumberOfPeaksRef = useRef();

  const handleApplyFilter = useCallback(() => {
    dispatch({
      type: AUTO_PEAK_PICKING,
      options: {
        maxNumberOfPeaks: maxNumberOfPeaksRef.current.value,
        minMaxRatio: minMaxRatioRef.current.value,
      },
    });
  }, [dispatch]);

  const handleCancelFilter = useCallback(() => {
    // dispatch({
    //   type: APPLY_MANUAL_PHASE_CORRECTION_FILTER,
    //   value: value,
    // });
  }, []);

  return (
    <div style={styles.container}>
      <span style={styles.label}>Max Number Of Peaks: </span>
      <input
        ref={maxNumberOfPeaksRef}
        name="maxNumberOfPeaks"
        style={styles.input}
        type="number"
        defaultValue={20}
        step="any"
      />
      <span style={styles.label}>Min Max Ratio: </span>
      <input
        ref={minMaxRatioRef}
        name="minMaxRatio"
        style={styles.input}
        type="number"
        defaultValue={0.1}
        step="0.1"
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

export default AutoPeakPickingOptionPanel;
