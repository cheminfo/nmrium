import { CSSProperties, useCallback, useRef } from 'react';

import { useDispatch } from '../context/DispatchContext';
import NumberInput from '../elements/NumberInput';
import {
  RESET_SELECTED_TOOL,
  AUTO_ZONES_DETECTION,
  CHANGE_ZONES_NOISE_FACTOR,
} from '../reducer/types/Types';

import HeaderActionButtons from './HeaderActionButtons';

const styles: Record<
  'container' | 'input' | 'inputContainer' | 'label',
  CSSProperties
> = {
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
};

function Zones2DOptionPanel() {
  const dispatch = useDispatch();
  const thresholdFactor = useRef<any>();

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
      <HeaderActionButtons
        onApply={handleApplyFilter}
        applyLabel="Auto Zones Picking"
        onCancel={handleCancelFilter}
      />
    </div>
  );
}

export default Zones2DOptionPanel;
