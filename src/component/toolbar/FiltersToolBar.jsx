import React, { useCallback, useState, useEffect } from 'react';

import { useDispatch } from '../context/DispatchContext';
import { SET_SELECTED_FILTER } from '../reducer/Actions';
import ToolTip from '../elements/ToolTip/ToolTip';
import { ToggleButton, ToggleButtonGroup } from '../elements/toggle';
import { Filters } from '../../data/data1d/filter1d/Filters';
import { isApplicable as isZeroFillingApplicable } from '../../data/data1d/filter1d/zeroFilling';
import { useChartData } from '../context/ChartContext';

const BasicToolBar = () => {
  const [option, setOption] = useState();
  const dispatch = useDispatch();
  const [selectedSpectrumInfo, setSelectedSpectrumInfo] = useState();
  const { data, activeSpectrum } = useChartData();
  const handleChangeOption = useCallback(
    (selectedFilter) => dispatch({ type: SET_SELECTED_FILTER, selectedFilter }),
    [dispatch],
  );

  const handleChange = useCallback(
    (selectedOption) => {
      setOption(selectedOption);
      handleChangeOption(selectedOption);
    },
    [handleChangeOption],
  );

  useEffect(() => {
    if (data && activeSpectrum) {
      const { isComplex, isFid } = data.find((d) => d.id === activeSpectrum.id);
      setSelectedSpectrumInfo({ info: { isComplex, isFid } });
    } else {
      setSelectedSpectrumInfo({ info: { isComplex: false, isFid: false } });
    }
  }, [activeSpectrum, data]);
  return (
    <ToggleButtonGroup value={option} onChange={handleChange}>
      {selectedSpectrumInfo && isZeroFillingApplicable(selectedSpectrumInfo) && (
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
      )}
    </ToggleButtonGroup>
  );
};

export default BasicToolBar;
