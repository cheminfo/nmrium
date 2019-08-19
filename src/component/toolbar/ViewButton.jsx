import React, { useState, useEffect, useCallback } from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import { useDispatch } from '../context/DispatchContext';
import { TOGGLE_REAL_IMAGINARY_VISIBILITY } from '../reducer/Actions';

const ViewButton = ({
  onChange,
  defaultValue = true,
  data,
  activeSpectrum,
}) => {
  const [option, setOption] = useState();
  const [isDisabled, setDisabled] = useState(true);
  const dispatch = useDispatch();

  const handleShowSpectrumTypeChang = useCallback(
    () => dispatch({ type: TOGGLE_REAL_IMAGINARY_VISIBILITY, isRealSpectrumVisible:!option }),
    [dispatch, option],
  );

  const handleChange = () => {
    setOption(!option);
    handleShowSpectrumTypeChang()
  };


  useEffect(() => {
    setOption(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    const sData =
      data && activeSpectrum && data.find((d) => d.id === activeSpectrum.id);
    if (activeSpectrum == null || sData === -1) {
      setDisabled(true);
      setOption(defaultValue);
    } else {
      setOption(sData.isRealSpectrumVisible);
      setDisabled(!sData.isComplex);
    }
  }, [activeSpectrum, data, defaultValue]);

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
