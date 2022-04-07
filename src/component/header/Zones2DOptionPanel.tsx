import { CSSProperties, useCallback, useRef } from 'react';

import { useDispatch } from '../context/DispatchContext';
import Button from '../elements/Button';
import NumberInput from '../elements/NumberInput';
import {
  AUTO_ZONES_DETECTION,
  CHANGE_ZONES_NOISE_FACTOR,
} from '../reducer/types/Types';

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
      <Button.Done onClick={handleApplyFilter} style={{ margin: '0 10px' }}>
        Auto Zones Picking
      </Button.Done>
    </div>
  );
}

export default Zones2DOptionPanel;
