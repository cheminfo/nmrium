import React, { Fragment, useEffect, useCallback } from 'react';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import { FaSearchMinus, FaMinus, FaBars, FaDownload } from 'react-icons/fa';
import { useDispatch } from '../context/DispatchContext';
import { SAVE_DATA_AS_JSON } from '../reducer/Actions';

const BasicToolBar = ({
  viewAlignValue,
  onFullZoomOut,
  onViewChanged,
  isFullZoomButtonVisible = true,
  isFullZoomButtonEnabled = true,
  isViewButtonVisible = true,
  isSaveButtonVisible = true,
  isSaveButtonEnabled = true,
  data,
}) => {
  const dispatch = useDispatch();

  const handleSaveDataAsJSON = useCallback(
    () => dispatch({ type: SAVE_DATA_AS_JSON }),
    [dispatch],
  );

  const handleOnKeyPressed = useCallback(
    (e) => {
      if (e.key === 'f') {
        onFullZoomOut();
      } else if (e.key === 'v') {
        onViewChanged();
      } else if (e.ctrlKey && e.key === 's') {
        handleSaveDataAsJSON();
        e.preventDefault();
      }
    },
    [onFullZoomOut, onViewChanged, handleSaveDataAsJSON],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleOnKeyPressed, false);

    return (_) => {
      document.removeEventListener('keydown', handleOnKeyPressed, false);
    };
  }, [handleOnKeyPressed]);

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
              disabled={data && data.length <= 1}
            >
              {viewAlignValue !== 0 ? <FaMinus /> : <FaBars />}
            </Button>
          </div>
        </Tooltip>
      )}

      {isSaveButtonVisible && (
        <Tooltip
          title="Save Data as JSON File ( Press Ctrl + S )"
          placement="right-start"
        >
          <Button
            className="general-fun-bt"
            onClick={handleSaveDataAsJSON}
            disabled={!isSaveButtonEnabled}
          >
            <FaDownload />
          </Button>
        </Tooltip>
      )}
    </Fragment>
  );
};

export default BasicToolBar;
