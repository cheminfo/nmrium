import { useEffect, useState, memo } from 'react';

import * as Filters from '../../data/Filters';
import { Data1D } from '../../data/types/data1d';
import generateNumbersPowerOfX from '../../data/utilities/generateNumbersPowerOfX';
import { useDispatch } from '../context/DispatchContext';
import ActionButtons from '../elements/ActionButtons';
import CheckBox from '../elements/CheckBox';
import Label from '../elements/Label';
import Select from '../elements/Select';
import { useFilter } from '../hooks/useFilter';
import useSpectrum from '../hooks/useSpectrum';
import {
  APPLY_ZERO_FILLING_FILTER,
  CALCULATE_ZERO_FILLING_FILTER,
  DISABLE_FILTER_LIVE_PREVIEW,
  RESET_SELECTED_TOOL,
} from '../reducer/types/Types';
import { options } from '../toolbar/ToolTypes';

import { HeaderContainer } from './HeaderContainer';

const Sizes = generateNumbersPowerOfX(8, 21);

function useInitZeroFillingSize() {
  const filter = useFilter(Filters.zeroFilling.id);
  const { data } = useSpectrum();

  if (filter) {
    return filter.value;
  } else if (data) {
    return 2 ** Math.round(Math.log2((data as Data1D).x.length));
  }
  return 0;
}

function ZeroFillingOptionsInnerPanel(props: { size: number }) {
  const dispatch = useDispatch();
  const [livePreview, setLivePreview] = useState<boolean>(true);
  const [size, setSize] = useState<number>(props.size);

  function handleApplyFilter() {
    dispatch({
      type: APPLY_ZERO_FILLING_FILTER,
      payload: {
        size,
      },
    });
  }

  function handleCancelFilter() {
    dispatch({
      type: RESET_SELECTED_TOOL,
    });
  }

  function dispatchLiveChanges(value) {
    dispatch({
      type: CALCULATE_ZERO_FILLING_FILTER,
      payload: {
        size: value,
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

  function checkChangeHandler(event: React.ChangeEvent<HTMLInputElement>) {
    const checked = event.target.checked;
    setLivePreview(checked);
    if (!checked) {
      //disable filter Live preview
      dispatch({
        type: DISABLE_FILTER_LIVE_PREVIEW,
        payload: { selectedTool: options.zeroFilling.id },
      });
    }
  }

  return (
    <HeaderContainer>
      <Label title="Size:  " style={{ label: { padding: '0 5px' } }}>
        <Select
          items={Sizes}
          style={{ marginLeft: 10, marginRight: 10 }}
          value={size}
          onChange={handleChangeSizeHandler}
        />
      </Label>
      <Label
        title="live preview "
        htmlFor="livePreview"
        style={{ label: { padding: '0 5px' } }}
      >
        <CheckBox
          name="livePreview"
          defaultChecked
          onChange={checkChangeHandler}
        />
      </Label>
      <ActionButtons onDone={handleApplyFilter} onCancel={handleCancelFilter} />
    </HeaderContainer>
  );
}

const MemoizedZeroFillingOptionsPanel = memo(ZeroFillingOptionsInnerPanel);

export default function ZeroFillingOptionsPanel() {
  const size = useInitZeroFillingSize();

  return <MemoizedZeroFillingOptionsPanel size={size} />;
}
