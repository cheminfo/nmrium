import React, { useState, useRef, useEffect } from 'react';
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
  peaktool: { id: 'peakTool', label: 'Peak Tool' },
};

const ToolBarPane = ({ onChangeOption, toolbarWidth,selectedValue }) => {
  const [option, setOption] = useState();
  const toolbarRef = useRef();
  const handleChange = (event, selectedOption) => {
    console.log(selectedOption);

    setOption(selectedOption);
    onChangeOption(selectedOption);
  };

  useEffect(() => {
    toolbarWidth(toolbarRef.current.clientWidth);
    console.log(option);
    setOption(option);
    onChangeOption(selectedValue);
  }, []);

  return (
    <div ref={toolbarRef} className="option-container">
      <ToggleButtonGroup
        size="small"
        value={option}
        exclusive
        onChange={handleChange}
      >
        <ToggleButton key={1} value={options.zoom.id} selected={(selectedValue === options.zoom.id)?true:false}>
          <Tooltip title={options.zoom.label} placement="right-start">
            <ZoomIn />
          </Tooltip>
        </ToggleButton>
        {/* <ToggleButton key={2} value={options.brush.id}>
          <Tooltip title={options.brush.label} placement="right-start">
            <CropFree />
          </Tooltip>
        </ToggleButton> */}
        <ToggleButton key={3} value={options.peaktool.id}>
          <Tooltip title={options.peaktool.label} placement="right-start">
            <Timeline />
          </Tooltip>
        </ToggleButton>
      </ToggleButtonGroup>
    </div>
  );
};

export default ToolBarPane;


ToolBarPane.defaultProps = {

  selectedValue : options.zoom.id

};

