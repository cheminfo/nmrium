import { CSSProperties, useCallback, useRef } from 'react';

import { useDispatch } from '../context/DispatchContext';
import Button from '../elements/Button';
import CheckBox from '../elements/CheckBox';
import NumberInput from '../elements/NumberInput';
import { AUTO_PEAK_PICKING } from '../reducer/types/Types';

const styles: Record<
  'container' | 'input' | 'inputContainer' | 'label',
  CSSProperties
> = {
  container: {
    height: '100%',
    display: 'flex',
    fontSize: '12px',
    alignItems: 'center',
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

function AutoPeakPickingOptionPanel() {
  const dispatch = useDispatch();
  const minMaxRatioRef = useRef<any>();
  const maxNumberOfPeaksRef = useRef<any>();
  const noiseFactor = useRef<any>();
  const lookNegativeRef = useRef<any>();

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
      <Button.Done onClick={handleApplyFilter} style={{ margin: '0 10px' }}>
        Apply
      </Button.Done>
    </div>
  );
}

export default AutoPeakPickingOptionPanel;
