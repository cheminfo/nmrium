import { useCallback, useRef } from 'react';

import { useDispatch } from '../context/DispatchContext';
import Button from '../elements/Button';
import CheckBox from '../elements/CheckBox';
import Label from '../elements/Label';
import NumberInput from '../elements/NumberInput';
import { AUTO_PEAK_PICKING } from '../reducer/types/Types';

import { HeaderContainer } from './HeaderContainer';

const inputStyle = {
  input: {
    width: '50px',
    margin: '0px',
  },
  inputContainer: {
    flex: '2',
  },
};

const labelStyle = {
  label: {
    fontWeight: 'normal',
    fontSize: '12px',
  },
  wrapper: {
    paddingRight: '5px',
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
    <HeaderContainer>
      <Label title="Max Number Of Peaks:" style={labelStyle}>
        <NumberInput
          ref={maxNumberOfPeaksRef}
          name="maxNumberOfPeaks"
          style={inputStyle}
          defaultValue={50}
        />
      </Label>
      <Label title="Noise factor:" style={labelStyle}>
        <NumberInput
          ref={noiseFactor}
          name="noiseFactor"
          style={inputStyle}
          defaultValue={3}
        />
      </Label>
      <Label title="Min Max Ratio:" style={labelStyle}>
        <NumberInput
          ref={minMaxRatioRef}
          name="minMaxRatio"
          style={inputStyle}
          defaultValue={0.1}
          step="0.01"
        />
      </Label>

      <Label title="Detect negative:" htmlFor="lookNegative" style={labelStyle}>
        <CheckBox name="lookNegative" ref={lookNegativeRef} />
      </Label>

      <Button.Done onClick={handleApplyFilter} style={{ margin: '0 10px' }}>
        Apply
      </Button.Done>
    </HeaderContainer>
  );
}

export default AutoPeakPickingOptionPanel;
