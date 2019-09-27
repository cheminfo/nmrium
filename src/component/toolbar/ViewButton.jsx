import React, { useState, useEffect, useCallback, memo } from 'react';
import Button from '@material-ui/core/Button';
import { useDispatch } from '../context/DispatchContext';
import { TOGGLE_REAL_IMAGINARY_VISIBILITY } from '../reducer/Actions';
import { useChartData } from '../context/ChartContext';
import ToolTip from '../elements/ToolTip/ToolTip';

const ViewButton = ({ defaultValue = true }) => {
  const [option, setOption] = useState();
  const [isDisabled, setDisabled] = useState(true);
  const dispatch = useDispatch();
  const { data, activeSpectrum } = useChartData();

  const handleShowSpectrumTypeChang = useCallback(
    () =>
      dispatch({
        type: TOGGLE_REAL_IMAGINARY_VISIBILITY,
        isRealSpectrumVisible: !option,
      }),
    [dispatch, option],
  );

  const handleChange = useCallback(() => {
    setOption(!option);
    handleShowSpectrumTypeChang();
  }, [option, handleShowSpectrumTypeChang]);

  useEffect(() => {
    setOption(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    const sData =
      data && activeSpectrum && data.find((d) => d.id === activeSpectrum.id);

    if (sData) {
      if (activeSpectrum == null || sData === -1) {
        setDisabled(true);
        setOption(defaultValue);
      } else {
        setOption(sData.isRealSpectrumVisible);
        setDisabled(!sData.isComplex);
      }
    }
  }, [activeSpectrum, data, defaultValue]);

  return activeSpectrum ? (
    <ToolTip
      title={option ? 'Real Spectrum' : 'Imaginary Spectrum'}
      popupPlacement="right"
    >
      <Button
        disabled={isDisabled}
        className="general-fun-bt"
        onClick={handleChange}
      >
        {option ? 'Re' : 'Im'}
      </Button>
    </ToolTip>
  ) : null;
};

export default memo(ViewButton);

ViewButton.defaultProps = {
  defaultValue: true,
};
