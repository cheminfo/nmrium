import React, { Fragment } from 'react';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import {FaSearchMinus, FaMinus, FaBars } from 'react-icons/fa';

const BasicToolBar = ({
  viewAlignValue,
  onFullZoomOut,
  onViewChanged,
  isFullZoomButtonVisible = true,
  isViewButtonVisible = true,

}) => {
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
