import React, { useState, useRef, useEffect ,useCallback} from 'react';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
// import CropFree from '@material-ui/icons/CropFree';
import ZoomIn from '@material-ui/icons/ZoomIn';
import Timeline from '@material-ui/icons/Timeline';
import Tooltip from '@material-ui/core/Tooltip';

// const GreenRadio = withStyles({
//   root: {
//     color: green[400],
//     "&$checked": {
//       color: green[600]
//     }
//   },
//   checked: {
// })(props => <Radio color="default" {...props} />);

export let options = {
  zoom: { id: 'zoom', label: 'Zoom' },
  peakTool: { id: 'peakPicking', label: 'Peak Tool' },
};

const FunctionToolBar = ({ onChangeOption, defaultValue }) => {
  const [option, setOption] = useState();
  const handleChange = (event, selectedOption) => {

    console.log(defaultValue);

   console.log(selectedOption);

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
      setOption(options.peakTool.id);
      onChangeOption(options.peakTool.id);
    }
  });

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
        {/* <ToggleButton key={2} value={options.brush.id}>
          <Tooltip title={options.brush.label} placement="right-start">
            <CropFree />
          </Tooltip>
        </ToggleButton> */}
        <ToggleButton key={3} value={options.peakTool.id}>
          <Tooltip title={options.peakTool.label} placement="right-start">
            <Timeline />
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
