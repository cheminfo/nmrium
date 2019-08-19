import React, { useState, useEffect, useCallback } from 'react';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ZoomIn from '@material-ui/icons/ZoomIn';
import Timeline from '@material-ui/icons/Timeline';
import Tooltip from '@material-ui/core/Tooltip';
import ShowChart from '@material-ui/icons/ShowChart';
import { useDispatch } from '../context/DispatchContext';
import { SET_SELECTED_TOOL } from '../reducer/Actions';

export let options = {
  zoom: { id: 'zoom', label: 'Zoom' },
  peakPicking: { id: 'peakPicking', label: 'Peak Tool' },
  integral: { id: 'integral', label: 'integral Tool' },
};

const FunctionToolBar = ({ defaultValue, activeSpectrum }) => {
  const [option, setOption] = useState();
  const dispatch = useDispatch();
  const handleChangeOption = useCallback(
    (selectedTool) => dispatch({ type: SET_SELECTED_TOOL, selectedTool }),
    [dispatch],
  );

  const handleChange = (event, selectedOption) => {
    if (selectedOption != null) {
      setOption(selectedOption);
      handleChangeOption(selectedOption);
    }
  };

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
    <div className="option-container" onKeyDown={handleOnKeyPressed}>
      <ToggleButtonGroup
        size="small"
        value={option}
        exclusive
        onChange={handleChange}
      >
        <ToggleButton key={1} value={options.zoom.id}>
          <Tooltip
            title={options.zoom.label + ' ( Press z )'}
            placement="right-start"
          >
            <ZoomIn />
          </Tooltip>
        </ToggleButton>

        <ToggleButton
          key={2}
          value={options.peakPicking.id}
          disabled={!activeSpectrum}
        >
          <Tooltip
            title={options.peakPicking.label + ' ( Press p )'}
            placement="right-start"
          >
            <Timeline />
          </Tooltip>
        </ToggleButton>

        <ToggleButton
          key={3}
          value={options.integral.id}
          disabled={!activeSpectrum}
        >
          <Tooltip
            title={options.integral.label + ' ( Press i )'}
            placement="right-start"
          >
            <ShowChart />
          </Tooltip>
        </ToggleButton>
      </ToggleButtonGroup>
    </div>
  );
};

export default FunctionToolBar;

FunctionToolBar.defaultProps = {
  defaultValue: options.zoom.id,
};
