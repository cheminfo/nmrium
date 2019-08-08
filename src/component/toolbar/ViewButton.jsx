import React, { useState, useEffect } from 'react';
// import ToggleButton from '@material-ui/lab/ToggleButton';
// import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';

const ViewButton = ({
  onChange,
  defaultValue = true,
  data,
  activeSpectrum,
}) => {
  const [option, setOption] = useState();
  const [isDisabled, setDisabled] = useState(false);

  const handleChange = () => {
    setOption(!option);
    onChange(!option);
  };

  useEffect(() => {
    setOption(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    const sData =
      data && activeSpectrum && data.find((d) => d.id === activeSpectrum.id);
      console.log(sData);
    if (activeSpectrum == null || sData === -1) {
      setDisabled(true);
    } else {
      setDisabled(data.isComplex);
    }
  },[activeSpectrum]);

  return (
    <Tooltip
      title={option ? 'Real Spectrum' : 'Imaginary Spectrum'}
      placement="right-start"
    >
      <Button
        disabled={isDisabled}
        className="general-fun-bt"
        onClick={handleChange}
      >
        {option ? 'Re' : 'Im'}
      </Button>
    </Tooltip>
  );
};

export default ViewButton;

ViewButton.defaultProps = {
  defaultValue: true,
};
