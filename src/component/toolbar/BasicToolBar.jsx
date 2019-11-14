import React, { Fragment, useEffect, useCallback } from 'react';
import { FaSearchMinus, FaDownload } from 'react-icons/fa';

import { useDispatch } from '../context/DispatchContext';
import {
  SAVE_DATA_AS_JSON,
  FULL_ZOOM_OUT,
  CHANGE_SPECTRUM_DIPSLAY_VIEW_MODE,
} from '../reducer/Actions';
import { useChartData } from '../context/ChartContext';
import ToolTip from '../elements/ToolTip/ToolTip';

const styles = {
  button: {
    backgroundColor: 'transparent',
    border: 'none',
    width: '35px',
    height: '35px',
    minHeight: '35px',
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

const BasicToolBar = ({
  isFullZoomButtonVisible = true,
  isFullZoomButtonEnabled = true,
  isViewButtonVisible = true,
  isSaveButtonVisible = true,
  isSaveButtonEnabled = true,
}) => {
  const dispatch = useDispatch();
  const { data, verticalAlign } = useChartData();

  const handleSaveDataAsJSON = useCallback(
    () => dispatch({ type: SAVE_DATA_AS_JSON }),
    [dispatch],
  );

  const handleFullZoomOut = useCallback(() => {
    dispatch({
      type: FULL_ZOOM_OUT,
    });
  }, [dispatch]);

  const handleChangeDisplayViewMode = useCallback(() => {
    dispatch({
      type: CHANGE_SPECTRUM_DIPSLAY_VIEW_MODE,
    });
  }, [dispatch]);

  const handleOnKeyPressed = useCallback(
    (e) => {
      if (e.key === 'f') {
        handleFullZoomOut();
      } else if (e.key === 'v') {
        handleChangeDisplayViewMode();
      } else if (e.ctrlKey && e.key === 's') {
        handleSaveDataAsJSON();
        e.preventDefault();
      }
    },
    [handleFullZoomOut, handleSaveDataAsJSON, handleChangeDisplayViewMode],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleOnKeyPressed, false);

    return () => {
      document.removeEventListener('keydown', handleOnKeyPressed, false);
    };
  }, [handleOnKeyPressed]);

  return (
    <Fragment>
      {isFullZoomButtonVisible && (
        <button
          type="button"
          style={styles.button}
          onClick={handleFullZoomOut}
          disabled={!isFullZoomButtonEnabled}
        >
          <ToolTip title="Full Zoom Out ( Press f )" popupPlacement="right">
            <FaSearchMinus />
          </ToolTip>
        </button>
      )}

      {isViewButtonVisible && (
        <button
          type="button"
          style={{ ...styles.button, display: 'block' }}
          onClick={handleChangeDisplayViewMode}
          disabled={data && data.length <= 1}
          className={
            verticalAlign !== 0
              ? 'ci-icon-nmr-overlay3-aligned'
              : 'ci-icon-nmr-overlay3'
          }
        >
          <ToolTip title="Spectra alignment" popupPlacement="right">
            <div />
            {/* {verticalAlign !== 0 ? <FaMinus /> : <FaBars />} */}
          </ToolTip>
        </button>
      )}

      {isSaveButtonVisible && (
        <button
          type="button"
          style={styles.button}
          onClick={handleSaveDataAsJSON}
          disabled={!isSaveButtonEnabled}
        >
          <ToolTip
            title="Save Data as JSON File ( Press Ctrl + S )"
            popupPlacement="right"
          >
            <FaDownload />
          </ToolTip>
        </button>
      )}
    </Fragment>
  );
};

export default BasicToolBar;
