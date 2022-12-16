import { CSSProperties, useCallback, useRef } from 'react';

import { useDispatch } from '../context/DispatchContext';
import Button from '../elements/Button';
import CheckBox from '../elements/CheckBox';
import Label from '../elements/Label';
import NumberInput from '../elements/NumberInput';
import { AUTO_RANGES_DETECTION } from '../reducer/types/Types';

import { headerLabelStyle } from './Header';
import { HeaderContainer } from './HeaderContainer';

const hintStyle: CSSProperties = {
  lineHeight: 2.5,
  userSelect: 'none',
  fontSize: '11px',
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
  container: {
    height: '100%',
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
    <HeaderContainer>
      <Label
        title="Detect negative:"
        htmlFor="lookNegative"
        style={headerLabelStyle}
      >
        <CheckBox name="lookNegative" ref={lookNegativeRef} />
      </Label>
      <Label title="Min Max Ratio:" style={headerLabelStyle}>
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
