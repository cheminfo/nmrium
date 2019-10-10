import React, { useState, useEffect, useCallback, memo } from 'react';
import ZoomIn from '@material-ui/icons/ZoomIn';
import Timeline from '@material-ui/icons/Timeline';
import ShowChart from '@material-ui/icons/ShowChart';

import { useDispatch } from '../context/DispatchContext';
import { SET_SELECTED_TOOL } from '../reducer/Actions';
import { useChartData } from '../context/ChartContext';
import ToolTip from '../elements/ToolTip/ToolTip';
import { ToggleButton, ToggleButtonGroup } from '../elements/toggle';

export let options = {
  zoom: { id: 'zoom', label: 'Zoom' },
  peakPicking: { id: 'peakPicking', label: 'Peak Tool' },
  integral: { id: 'integral', label: 'integral Tool' },
};

const FunctionToolBar = ({ defaultValue }) => {
  const [option, setOption] = useState();
  const dispatch = useDispatch();
  const handleChangeOption = useCallback(
    (selectedTool) => dispatch({ type: SET_SELECTED_TOOL, selectedTool }),
    [dispatch],
  );

  const { activeSpectrum } = useChartData();

  const handleChange = useCallback(
    (selectedOption) => {
      if (selectedOption != null) {
        setOption(selectedOption);
        handleChangeOption(selectedOption);
      }
    },
    [handleChangeOption],
  );

  const handleOnKeyPressed = useCallback(
    (e) => {
      if (e.key === 'z') {
        setOption(options.zoom.id);
        handleChangeOption(options.zoom.id);
      } else if (e.key === 'p') {
        setOption(options.peakPicking.id);
        handleChangeOption(options.peakPicking.id);
      } else if (e.key === 'i') {
        setOption(options.integral.id);
        handleChangeOption(options.integral.id);
      }
    },
    [handleChangeOption],
  );

  useEffect(() => {
    setOption(defaultValue);
    document.addEventListener('keydown', handleOnKeyPressed, false);
    return () => {
      document.removeEventListener('keydown', handleOnKeyPressed, false);
    };
  }, [defaultValue, handleOnKeyPressed]);

  return (
    <ToggleButtonGroup value={option} onChange={handleChange}>
      <ToggleButton key={1} value={options.zoom.id}>
        <ToolTip
          title={`${options.zoom.label} ( Press z )`}
          popupPlacement="right"
          offset={{ x: 10, y: 0 }}
        >
          <ZoomIn />
        </ToolTip>
      </ToggleButton>

      <ToggleButton
        key={2}
        value={options.peakPicking.id}
        disabled={!activeSpectrum}
      >
        <ToolTip
          title={`${options.peakPicking.label} ( Press p )`}
          popupPlacement="right"
          offset={{ x: 10, y: 0 }}
        >
          <Timeline />
        </ToolTip>
      </ToggleButton>

      <ToggleButton
        key={3}
        value={options.integral.id}
        disabled={!activeSpectrum}
      >
        <ToolTip
          title={`${options.integral.label} ( Press i )`}
          popupPlacement="right"
          offset={{ x: 10, y: 0 }}
        >
          <ShowChart />
        </ToolTip>
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default memo(FunctionToolBar);

FunctionToolBar.defaultProps = {
  defaultValue: options.zoom.id,
};
