import { useCallback, useRef } from 'react';

import { useDispatch } from '../context/DispatchContext';
import NumberInput from '../elements/NumberInput';
import {
  RESET_SELECTED_TOOL,
  AUTO_ZONES_DETECTION,
  CHANGE_ZONES_NOISE_FACTOR,
} from '../reducer/types/Types';

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

function Zones2DOptionPanel() {
  const dispatch = useDispatch();
  const thresholdFactor = useRef();

  const handleApplyFilter = useCallback(() => {
    dispatch({
      type: AUTO_ZONES_DETECTION,
      options: {
        thresholdFactor: thresholdFactor.current.value,
      },
    });
  }, [dispatch]);

  const handleCancelFilter = useCallback(() => {
    dispatch({
      type: RESET_SELECTED_TOOL,
    });
  }, [dispatch]);

  const handleInput = useCallback(
    (e) => {
      if (e.target) {
        dispatch({ type: CHANGE_ZONES_NOISE_FACTOR, payload: e.target.value });
      }
    },
    [dispatch],
  );

  return (
    <div style={styles.container}>
      <NumberInput
        ref={thresholdFactor}
        label="NoiseFactor"
        name="noiseFactor"
        style={{
          input: styles.input,
          inputContainer: styles.inputContainer,
          label: styles.label,
        }}
        defaultValue={1}
        onChange={handleInput}
      />
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
}

export default Zones2DOptionPanel;
