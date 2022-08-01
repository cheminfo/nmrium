import { useCallback, useRef } from 'react';

import { useDispatch } from '../context/DispatchContext';
import Button from '../elements/Button';
import Label from '../elements/Label';
import NumberInput from '../elements/NumberInput';
import {
  AUTO_ZONES_DETECTION,
  CHANGE_ZONES_NOISE_FACTOR,
} from '../reducer/types/Types';

import { HeaderContainer } from './HeaderContainer';

const inputStyle = {
  input: {
    width: '50px',
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
    <HeaderContainer>
      <Label title="Noise factor :" htmlFor="livePreview" style={labelStyle}>
        <NumberInput
          ref={thresholdFactor}
          name="noiseFactor"
          style={inputStyle}
          defaultValue={1}
          onChange={handleInput}
        />
      </Label>
      <Button.Done onClick={handleApplyFilter} style={{ margin: '0 10px' }}>
        Auto Zones Picking
      </Button.Done>
    </HeaderContainer>
  );
}

export default Zones2DOptionPanel;
