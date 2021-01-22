import { useCallback, useRef } from 'react';

import { useDispatch } from '../context/DispatchContext';
import CheckBox from '../elements/CheckBox';
import NumberInput from '../elements/NumberInput';
import { AUTO_PEAK_PICKING, RESET_SELECTED_TOOL } from '../reducer/types/Types';

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
    width: '60px',
    borderRadius: '5px',
    border: '0.55px solid #c7c7c7',
    margin: '0px 5px',
    userSelect: 'none',
  },
};

function AutoPeakPickingOptionPanel() {
  const dispatch = useDispatch();
  const minMaxRatioRef = useRef();
  const maxNumberOfPeaksRef = useRef();
  const noiseFactor = useRef();
  const lookNegativeRef = useRef();

  const handleApplyFilter = useCallback(() => {
    dispatch({
      type: AUTO_PEAK_PICKING,
      options: {
        maxNumberOfPeaks: maxNumberOfPeaksRef.current.value,
        minMaxRatio: minMaxRatioRef.current.value,
        noiseFactor: noiseFactor.current.value,
        lookNegative: lookNegativeRef.current.checked,
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
        style={{
          input: styles.input,
          inputContainer: styles.inputContainer,
          label: styles.label,
        }}
        defaultValue={50}
      />
      <NumberInput
        ref={noiseFactor}
        label="Noise factor"
        name="noiseFactor"
        style={{
          input: styles.input,
          inputContainer: styles.inputContainer,
          label: styles.label,
        }}
        defaultValue={3}
      />
      <NumberInput
        ref={minMaxRatioRef}
        label="Min Max Ratio:"
        name="minMaxRatio"
        style={{
          input: styles.input,
          inputContainer: styles.inputContainer,
          label: styles.label,
        }}
        defaultValue={0.1}
        step="0.01"
      />

      <div style={{ justifyItems: 'baseline', marginRight: '3px' }}>
        <label
          style={{ marginRight: '2px', lineHeight: 2, userSelect: 'none' }}
          htmlFor="lookNegative"
        >
          Detect Negative:
        </label>
        <CheckBox name="lookNegative" ref={lookNegativeRef} />
      </div>

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
}

export default AutoPeakPickingOptionPanel;
