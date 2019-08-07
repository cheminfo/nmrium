import React, { useState, useEffect ,useCallback} from 'react';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
// import CropFree from '@material-ui/icons/CropFree';
import ZoomIn from '@material-ui/icons/ZoomIn';
import Timeline from '@material-ui/icons/Timeline';
import Tooltip from '@material-ui/core/Tooltip';
import ShowChart from '@material-ui/icons/ShowChart';


export let options = {
  zoom: { id: 'zoom', label: 'Zoom' },
  peakPicking: { id: 'peakPicking', label: 'Peak Tool' },
  integral: { id: 'integral', label: 'integral Tool' },

};

const FunctionToolBar = ({ onChangeOption, defaultValue,data,activeSpectrum }) => {
  const [option, setOption] = useState();
  const handleChange = (event, selectedOption) => {

    if (selectedOption != null) {
      setOption(selectedOption);
      onChangeOption(selectedOption);
    }
  };

  const handleOnKeyPressed = useCallback((e) => {
    if (e.key === 'z') {
      setOption(options.zoom.id);
      onChangeOption(options.zoom.id);
    } else if (e.key === 'p') {
      setOption(options.peakPicking.id);
      onChangeOption(options.peakPicking.id);
    }else if (e.key === 'i') {
      setOption(options.integral.id);
      onChangeOption(options.integral.id);
    }
  });

  useEffect(() => {
    setOption(defaultValue);
    document.addEventListener('keydown', handleOnKeyPressed, false);
  }, []);

  useEffect(() => {
    setOption(defaultValue);
    document.addEventListener('keydown', handleOnKeyPressed, false);
  }, []);

  useEffect(() => {
    return () => {
      document.removeEventListener('keydown', handleOnKeyPressed, false);
    };
  }, []);

  return (
    <div
      className="option-container"
      onKeyDown={handleOnKeyPressed}
    >
      <ToggleButtonGroup
        size="small"
        value={option}
        exclusive
        onChange={handleChange}
      >
        {/* selected={(selectedValue === options.zoom.id)?true:false} */}

        <ToggleButton key={1} value={options.zoom.id}>
          <Tooltip title={options.zoom.label} placement="right-start">
            <ZoomIn />
          </Tooltip>
        </ToggleButton>

        <ToggleButton key={2} value={options.peakPicking.id} disabled={!activeSpectrum}>
          <Tooltip title={options.peakPicking.label} placement="right-start">
            <Timeline />
          </Tooltip>
        </ToggleButton>


        <ToggleButton key={3} value={options.integral.id} disabled={!activeSpectrum}>
          <Tooltip title={options.integral.label} placement="right-start">
            <ShowChart  />
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
