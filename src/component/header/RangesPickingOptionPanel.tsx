import { CSSProperties, useCallback, useRef } from 'react';

import { useDispatch } from '../context/DispatchContext';
import Button from '../elements/Button';
import CheckBox from '../elements/CheckBox';
import Label from '../elements/Label';
import NumberInput from '../elements/NumberInput';
import { AUTO_RANGES_DETECTION } from '../reducer/types/Types';

import { HeaderContainer } from './HeaderContainer';

const hintStyle: CSSProperties = {
  lineHeight: 2,
  userSelect: 'none',
  fontSize: '11px',
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

const inputStyle = {
  input: {
    height: '100%',
    width: '50px',
    borderRadius: '5px',
    border: '0.55px solid #c7c7c7',
    margin: '0px',
  },
  inputContainer: {
    flex: 2,
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
          minMaxRatio: Number(minMaxRatioRef.current.value) || 0.05,
          lookNegative: lookNegativeRef.current.checked,
        },
      },
    });
  }, [dispatch]);
  return (
    <HeaderContainer
      style={{
        alignItems: 'baseline',
      }}
    >
      <Label title="Detect negative:" htmlFor="lookNegative" style={labelStyle}>
        <CheckBox name="lookNegative" ref={lookNegativeRef} />
      </Label>
      <Label title="Min Max Ratio:" style={labelStyle}>
        <NumberInput
          ref={minMaxRatioRef}
          name="minMaxRatio"
          style={inputStyle}
          defaultValue={0.05}
          step="0.01"
        />
      </Label>

      <Button.Done onClick={handleApplyFilter} style={{ margin: '0 10px' }}>
        Auto ranges picking
      </Button.Done>
      <span style={hintStyle}>
        Manual selection using SHIFT + select zone or click on Auto peak picking
      </span>
    </HeaderContainer>
  );
}

export default RangesPickingOptionPanel;
