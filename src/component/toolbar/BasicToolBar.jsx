import React, { Fragment, useEffect, useCallback, useState } from 'react';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import { FaSearchMinus, FaMinus, FaBars } from 'react-icons/fa';

const BasicToolBar = ({
  viewAlignValue,
  onFullZoomOut,
  onViewChanged,
  isFullZoomButtonVisible = true,
  isFullZoomButtonEnabled = true,
  isViewButtonVisible = true,
  isViewButtonEnabled = true,
  data
}) => {

  const handleOnKeyPressed = useCallback((e) => {
    if (e.key === 'f') {
      onFullZoomOut();
    } else if (e.key === 'v') {
      onViewChanged();
    }
  });

  useEffect(() => {
    document.addEventListener('keydown', handleOnKeyPressed, false);
  }, []);

  useEffect(() => {
    return () => {
      document.removeEventListener('keydown', handleOnKeyPressed, false);
    };
  }, []);

  return (
    <Fragment>
      {isFullZoomButtonVisible && (
        <Tooltip title="Full Zoom Out ( Press f )" placement="right-start">
          <Button
            className="general-fun-bt"
            onClick={onFullZoomOut}
            disabled={isFullZoomButtonEnabled}
          >
            <FaSearchMinus />
          </Button>
        </Tooltip>
      )}

      {isViewButtonVisible && (
        <Tooltip title="Spectrums  alignment " placement="right-start">
          <div>
            <Button
              className="general-fun-bt"
              onClick={onViewChanged}
              disabled={data && data.length <=1}
            >
              {viewAlignValue !== 0 ? <FaMinus /> : <FaBars />}
            </Button>
          </div>
        </Tooltip>
      )}
    </Fragment>
  );
};

export default BasicToolBar;
