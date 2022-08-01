import { useEffect, useState } from 'react';

import * as Filters from '../../data/Filters';
import { Data1D } from '../../data/types/data1d';
import generateNumbersPowerOfX from '../../data/utilities/generateNumbersPowerOfX';
import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import ActionButtons from '../elements/ActionButtons';
import CheckBox from '../elements/CheckBox';
import Label from '../elements/Label';
import Select from '../elements/Select';
import { useFilter } from '../hooks/useFilter';
import {
  APPLY_ZERO_FILLING_FILTER,
  CALCULATE_ZERO_FILLING_FILTER,
  DISABLE_FILTER_LIVE_PREVIEW,
  RESET_SELECTED_TOOL,
} from '../reducer/types/Types';
import { options } from '../toolbar/ToolTypes';

import { HeaderContainer } from './HeaderContainer';

const Sizes = generateNumbersPowerOfX(8, 21);

function ZeroFillingOptionsPanel() {
  const dispatch = useDispatch();
  const { data, activeSpectrum } = useChartData();
  const [size, setSize] = useState<number>();
  const [livePreview, setLivePreview] = useState<boolean>(true);
  const filter = useFilter(Filters.zeroFilling.id);

  const handleApplyFilter = () => {
    dispatch({
      type: APPLY_ZERO_FILLING_FILTER,
      payload: {
        size,
      },
    });
  };

  const handleCancelFilter = () => {
    dispatch({
      type: RESET_SELECTED_TOOL,
    });
  };

  useEffect(() => {
    if (filter) {
      setSize(filter.value);
    } else if (data && activeSpectrum?.id) {
      const spectraSize =
        2 **
        Math.round(
          Math.log2((data[activeSpectrum.index].data as Data1D).x.length),
        );

      setSize(spectraSize || 256);
    }
  }, [activeSpectrum, data, filter]);

  useEffect(() => {
    if (livePreview && size) {
      dispatch({
        type: CALCULATE_ZERO_FILLING_FILTER,
        payload: {
          size,
        },
      });
    }
  }, [dispatch, livePreview, size]);

  const checkChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setLivePreview(checked);
    if (!checked) {
      //disable filter Live preview
      dispatch({
        type: DISABLE_FILTER_LIVE_PREVIEW,
        payload: { selectedTool: options.zeroFilling.id },
      });
    }
  };

  return (
    <HeaderContainer>
      <Label title="Size:  " style={{ label: { padding: '0 5px' } }}>
        <Select
          data={Sizes}
          style={{ marginLeft: 10, marginRight: 10 }}
          value={size}
          onChange={(value) => setSize(Number(value))}
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

export default ZeroFillingOptionsPanel;
