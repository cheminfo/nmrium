import React, { useState, useRef, useEffect } from 'react';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Tooltip from '@material-ui/core/Tooltip';




const ShowToolBar = ({ onChangeOption,selectedValue,defaultValue }) => {
  const [option, setOption] = useState();
  const toolbarRef = useRef();
  const handleChange = (event, selectedOption) => {
    if(selectedOption != null){
      setOption(selectedOption);
      onChangeOption(selectedOption);
  
    }
    console.log(selectedOption);
  };

  useEffect(() => {
    console.log(option);
    setOption(defaultValue);
    // onChangeOption(selectedValue);
  }, []);

  return (
    <div ref={toolbarRef} className="show-option-container">
      <ToggleButtonGroup
        size="small"
        value={option}
        exclusive
        onChange={handleChange}
      >
        <ToggleButton key={1} value={true} >
          <Tooltip title="Real spectrum" placement="right-start">
            <label>re</label>
          </Tooltip>
        </ToggleButton>
        <ToggleButton key={2} value={false}>
          <Tooltip title="Imaginary spectrum" placement="right-start">
             <label>im</label>
          </Tooltip>
        </ToggleButton>
      </ToggleButtonGroup>
    </div>
  );
};

export default ShowToolBar;


ShowToolBar.defaultProps = {

  selectedValue : true,
  defaultValue:true

};

