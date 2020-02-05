import React, { useCallback, useRef } from 'react';

import { useDispatch } from '../context/DispatchContext';
import { AUTO_PEAK_PICKING, RESET_SELECTED_TOOL } from '../reducer/Actions';
import NumberInput from '../elements/NumberInput';

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
  actionButton: {
    height: '100%',
    width: '60px',
    borderRadius: '5px',
    border: '0.55px solid #c7c7c7',
    margin: '0px 5px',
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
    dispatch({
      type: RESET_SELECTED_TOOL,
    });
  }, [dispatch]);

  return (
    <div style={styles.container}>
      <NumberInput
        ref={maxNumberOfPeaksRef}
        label="Max Number Of Peaks:"
        name="maxNumberOfPeaks"
        style={{ input: styles.input }}
        defaultValue={50}
      />
      <NumberInput
        ref={minMaxRatioRef}
        label="Min Max Ratio:"
        name="minMaxRatio"
        style={{ input: styles.input }}
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
