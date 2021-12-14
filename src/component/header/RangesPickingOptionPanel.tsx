import { CSSProperties, useCallback, useRef } from 'react';

import { useDispatch } from '../context/DispatchContext';
import CheckBox from '../elements/CheckBox';
import NumberInput from '../elements/NumberInput';
import {
  AUTO_RANGES_DETECTION,
  RESET_SELECTED_TOOL,
} from '../reducer/types/Types';

const styles: Record<
  'container' | 'input' | 'inputContainer' | 'label' | 'actionButton' | 'hint',
  CSSProperties
> = {
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
  inputContainer: {
    flex: 2,
  },
  label: {
    flex: 5,
  },
  actionButton: {
    height: '100%',
    minWidth: '60px',
    borderRadius: '5px',
    border: '0.55px solid #c7c7c7',
    margin: '0px 5px',
    userSelect: 'none',
    padding: '3px',
  },
  hint: {
    lineHeight: 2,
    userSelect: 'none',
    fontSize: '11px',
  },
};

function RangesPickingOptionPanel() {
  const dispatch = useDispatch();
  const lookNegativeRef = useRef<any>();
  const minMaxRatioRef = useRef<any>();

  const handleApplyFilter = useCallback(() => {
    dispatch({
      type: AUTO_RANGES_DETECTION,
      options: {
        peakPicking: {
          minMaxRatio: minMaxRatioRef.current.value,
          lookNegative: lookNegativeRef.current.checked,
        },
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
      <div style={{ justifyItems: 'baseline', margin: '0 10px' }}>
        <label
          style={{ marginRight: '2px', lineHeight: 2, userSelect: 'none' }}
          htmlFor="lookNegative"
        >
          Detect negative:
        </label>
        <CheckBox name="lookNegative" ref={lookNegativeRef} />
      </div>
      <NumberInput
        ref={minMaxRatioRef}
        label="Min Max Ratio:"
        name="minMaxRatio"
        style={{
          input: styles.input,
          inputContainer: styles.inputContainer,
          label: styles.label,
        }}
        defaultValue={0.05}
        step="0.01"
      />
      <button
        type="button"
        style={styles.actionButton}
        onClick={handleApplyFilter}
        data-test-id="auto-ranges-detection-btn"
      >
        Auto ranges picking
      </button>
      <button
        type="button"
        style={styles.actionButton}
        onClick={handleCancelFilter}
      >
        Cancel
      </button>
      <span style={styles.hint}>
        Manual selection using SHIFT + select zone or click on Auto peak picking
      </span>
    </div>
  );
}

export default RangesPickingOptionPanel;
