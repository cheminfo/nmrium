import React, { useState, useEffect } from 'react';
// import ToggleButton from '@material-ui/lab/ToggleButton';
// import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';

const ViewButton = ({ onChange, defaultValue=true }) => {
  const [option, setOption] = useState();
  
  const handleChange = () => {
      setOption(!option);
      onChange(!option);
   
  };

  useEffect(() => {
    setOption(defaultValue);
  }, [defaultValue]);

  return (
    <Tooltip title={option ? "Real Spectrum" : "Imaginary Spectrum"} placement="right-start">
      <Button className="general-fun-bt" onClick={handleChange}>
        {option ? "Re" : "Im"}
      </Button>
    </Tooltip>
  );
};

export default ViewButton;

ViewButton.defaultProps = {
  defaultValue: true,
};
