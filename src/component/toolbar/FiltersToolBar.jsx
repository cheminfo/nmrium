import React, { useCallback, useState } from 'react';

import { useDispatch } from '../context/DispatchContext';
import { SET_SELECTED_FILTER } from '../reducer/Actions';
import ToolTip from '../elements/ToolTip/ToolTip';
import { ToggleButton, ToggleButtonGroup } from '../elements/toggle';
import { Filters } from '../../data/data1d/filter1d/Filters';

const BasicToolBar = () => {
  const [option, setOption] = useState();
  const dispatch = useDispatch();
  const handleChangeOption = useCallback(
    (selectedFilter) => dispatch({ type: SET_SELECTED_FILTER, selectedFilter }),
    [dispatch],
  );

  const handleChange = useCallback(
    (selectedOption) => {
        console.log(selectedOption)
      setOption(selectedOption);
      handleChangeOption(selectedOption);
    },
    [handleChangeOption],
  );

  return (
    <ToggleButtonGroup value={option} onChange={handleChange}>
      <ToggleButton
        key={Filters.zeroFilling.name}
        value={Filters.zeroFilling.name}
      >
        <ToolTip
          title={`Zero Filling Filter`}
          popupPlacement="right"
          offset={{ x: 10, y: 0 }}
        >
          Zero
        </ToolTip>
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default BasicToolBar;
