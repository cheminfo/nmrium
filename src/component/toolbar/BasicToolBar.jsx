/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { Fragment, useEffect, useCallback, useState } from 'react';
import { FaDownload, FaExpand } from 'react-icons/fa';

import { useDispatch } from '../context/DispatchContext';
import {
  SAVE_DATA_AS_JSON,
  FULL_ZOOM_OUT,
  CHANGE_SPECTRUM_DIPSLAY_VIEW_MODE,
  TOGGLE_REAL_IMAGINARY_VISIBILITY,
} from '../reducer/Actions';
import { useChartData } from '../context/ChartContext';
import ToolTip from '../elements/ToolTip/ToolTip';

const styles = css`
  background-color: transparent;
  border: none;
  width: 35px;
  height: 35px;
  min-height: 35px;
  background-position: center center;
  background-repeat: no-repeat;
  background-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: outline;
  :focus {
    outline: none !important;
  }
`;

const BasicToolBar = ({
  isFullZoomButtonVisible = true,
  isFullZoomButtonEnabled = true,
  isViewButtonVisible = true,
  isSaveButtonVisible = true,
  isSaveButtonEnabled = true,
}) => {
  const dispatch = useDispatch();
  const { data, verticalAlign, activeSpectrum } = useChartData();
  const [isRealSpectrumShown, setIsRealSpectrumShown] = useState(false);
  const [spectrumsCount, setSpectrumsCount] = useState(0);
  const [selectedSpectrumInfo, setSelectedSpectrumInfo] = useState();

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

  const changeSpectrumViewHandler = useCallback(() => {
    dispatch({
      type: TOGGLE_REAL_IMAGINARY_VISIBILITY,
      isRealSpectrumVisible: !isRealSpectrumShown,
    });
    setIsRealSpectrumShown(!isRealSpectrumShown);
  }, [dispatch, isRealSpectrumShown]);

  useEffect(() => {
    document.addEventListener('keydown', handleOnKeyPressed, false);

    return () => {
      document.removeEventListener('keydown', handleOnKeyPressed, false);
    };
  }, [handleOnKeyPressed]);

  useEffect(() => {
    if (data) {
      setSpectrumsCount(data.length);
      if (activeSpectrum) {
        const { info } = data.find((d) => d.id === activeSpectrum.id);
        setSelectedSpectrumInfo(info);
      } else {
        setSelectedSpectrumInfo({ isComplex: false, isFid: false });
      }
    }
  }, [activeSpectrum, data]);

  return (
    <Fragment>
      {isFullZoomButtonVisible && (
        <button
          type="button"
          css={styles}
          onClick={handleFullZoomOut}
          disabled={!isFullZoomButtonEnabled}
        >
          <ToolTip title="Full Zoom Out ( Press f )" popupPlacement="right">
            <FaExpand />
          </ToolTip>
        </button>
      )}

      {isViewButtonVisible && spectrumsCount > 1 && (
        <button
          type="button"
          css={[styles, { display: 'block' }]}
          onClick={handleChangeDisplayViewMode}
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
          css={styles}
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

      {selectedSpectrumInfo && selectedSpectrumInfo.isComplex && (
        <button
          css={styles}
          type="button"
          onClick={changeSpectrumViewHandler}
          className={'ci-icon-nmr-real-imag'}
        >
          <ToolTip
            title={isRealSpectrumShown ? 'Real Spectrum' : 'Imaginary Spectrum'}
            popupPlacement="right"
          />
        </button>
      )}
    </Fragment>
  );
};

export default BasicToolBar;
