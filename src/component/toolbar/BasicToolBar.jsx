import React, { Fragment, useEffect, useCallback } from 'react';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import { FaSearchMinus, FaMinus, FaBars } from 'react-icons/fa';

const BasicToolBar = ({
  viewAlignValue,
  onFullZoomOut,
  onViewChanged,
  isFullZoomButtonVisible = true,
  isViewButtonVisible = true,
}) => {
  const handleOnKeyPressed = useCallback((e) => {
    console.log(e.key);

    if (e.key === 'f') {
      onFullZoomOut();
    }
    else if (e.key === 'v') {
      onViewChanged();
    }
  });

  useEffect(() => {
    document.addEventListener('keydown', handleOnKeyPressed, false);
  }, []);

  useEffect(() => {
    // return () => {
    //   document.removeEventListener('keydown', handleOnKeyPressed, false);
    // };
  }, []);

  return (
    <Fragment>
      {isFullZoomButtonVisible && (
        <Tooltip title="Full Zoom Out" placement="right-start">
          <Button className="general-fun-bt" onClick={onFullZoomOut}>
            <FaSearchMinus />
          </Button>
        </Tooltip>
      )}

      {isViewButtonVisible && (
        <Tooltip title="Spectrums  alignment " placement="right-start">
          <Button className="general-fun-bt" onClick={onViewChanged}>
            {viewAlignValue !== 0 ? <FaMinus /> : <FaBars />}
          </Button>
        </Tooltip>
      )}
    </Fragment>
  );
};

export default BasicToolBar;
