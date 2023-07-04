import { NmrData1D } from 'cheminfo-types';
import { Filters } from 'nmr-processing';
import { useEffect, useState, memo } from 'react';
import { Checkbox, CheckedState, Field } from 'react-science/ui';

import generateNumbersPowerOfX from '../../data/utilities/generateNumbersPowerOfX';
import { useDispatch } from '../context/DispatchContext';
import ActionButtons from '../elements/ActionButtons';
import Label from '../elements/Label';
import Select from '../elements/Select';
import { useFilter } from '../hooks/useFilter';
import useSpectrum from '../hooks/useSpectrum';

import { headerLabelStyle } from './Header';
import { HeaderContainer } from './HeaderContainer';

const Sizes = generateNumbersPowerOfX(8, 21);

function useInitZeroFillingSize() {
  const filter = useFilter(Filters.zeroFilling.id);
  const { data } = useSpectrum();
  if (filter) {
    return filter.value.nbPoints;
  } else if (data) {
    return 2 ** Math.round(Math.log2((data as NmrData1D).x.length * 2));
  }
  return 0;
}

function ZeroFillingOptionsInnerPanel(props: { size: number }) {
  const dispatch = useDispatch();
  const [livePreview, setLivePreview] = useState<CheckedState>(true);
  const [size, setSize] = useState<number>(props.size);

  function handleApplyFilter() {
    dispatch({
      type: 'APPLY_ZERO_FILLING_FILTER',
      payload: {
        nbPoints: size,
      },
    });
  }

  function handleCancelFilter() {
    dispatch({
      type: 'RESET_SELECTED_TOOL',
    });
  }

  function dispatchLiveChanges(nbPoints) {
    dispatch({
      type: 'CALCULATE_ZERO_FILLING_FILTER',
      payload: {
        nbPoints,
      },
    });
  }

  function handleChangeSizeHandler(value) {
    setSize(value);
    dispatchLiveChanges(value);
  }

  useEffect(() => {
    if (livePreview && size) {
      dispatchLiveChanges(size);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <HeaderContainer>
      <Label title="Size:  " style={headerLabelStyle}>
        <Select
          items={Sizes}
          style={{ marginLeft: 10, marginRight: 10 }}
          value={size}
          onChange={handleChangeSizeHandler}
        />
      </Label>
      <Field label="Live preview" name="livePreview">
        <Checkbox checked={livePreview} onChange={setLivePreview} />
      </Field>
      <ActionButtons onDone={handleApplyFilter} onCancel={handleCancelFilter} />
    </HeaderContainer>
  );
}

const MemoizedZeroFillingOptionsPanel = memo(ZeroFillingOptionsInnerPanel);

export default function ZeroFillingOptionsPanel() {
  const size = useInitZeroFillingSize();

  return <MemoizedZeroFillingOptionsPanel size={size} />;
}
