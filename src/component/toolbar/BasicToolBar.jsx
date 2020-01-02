/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { Fragment, useEffect, useCallback, useState } from 'react';
import {
  FaDownload,
  FaExpand,
  FaFileDownload,
  FaFileImage,
  FaCopy,
  FaFileExport,
} from 'react-icons/fa';
import { useAlert } from 'react-alert';

import { useDispatch } from '../context/DispatchContext';
import {
  FULL_ZOOM_OUT,
  CHANGE_SPECTRUM_DISPLAY_VIEW_MODE,
  TOGGLE_REAL_IMAGINARY_VISIBILITY,
  SET_SPECTRUMS_VERTICAL_ALIGN,
  EXPORT_DATA,
} from '../reducer/Actions';
import { useChartData } from '../context/ChartContext';
import ToolTip from '../elements/ToolTip/ToolTip';
import MenuButton from '../elements/MenuButton';

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

const menuButton = css`
  background-color: transparent;
  border: none;
  border-bottom: 0.55px solid whitesmoke;
  height: 35px;
  outline: outline;
  display: flex;
  justify-content: flex-start;

  :focus {
    outline: none !important;
  }
  span {
    font-size: 10px;
    padding: 0px 10px;
  }
`;

const BasicToolBar = ({
  isFullZoomButtonVisible = true,
  isFullZoomButtonEnabled = true,
  isViewButtonVisible = true,
  // isSaveButtonVisible = true,
  // isSaveButtonEnabled = true,
}) => {
  const dispatch = useDispatch();
  const { data, activeSpectrum, verticalAlign } = useChartData();
  const [isRealSpectrumShown, setIsRealSpectrumShown] = useState(false);
  const [spectrumsCount, setSpectrumsCount] = useState(0);
  const [selectedSpectrumInfo, setSelectedSpectrumInfo] = useState();
  const [isStacked, activateStackView] = useState(false);
  const alert = useAlert();
  const handleFullZoomOut = useCallback(() => {
    dispatch({
      type: FULL_ZOOM_OUT,
    });
  }, [dispatch]);

  const saveAsSVGHandler = useCallback(() => {
    dispatch({
      type: EXPORT_DATA,
      exportType: 'svg',
    });
  }, [dispatch]);

  const saveAsPNGHandler = useCallback(
    () => dispatch({ type: EXPORT_DATA, exportType: 'png' }),
    [dispatch],
  );
  const saveToClipboardHandler = useCallback(() => {
    dispatch({ type: EXPORT_DATA, exportType: 'copy' });
    alert.show('Spectrum copied to clipboard');
  }, [alert, dispatch]);
  const saveAsJSONHandler = useCallback(
    () => dispatch({ type: EXPORT_DATA, exportType: 'json' }),
    [dispatch],
  );

  const handleChangeDisplayViewMode = useCallback(() => {
    const flag = !isStacked;
    activateStackView(flag);
    dispatch({
      type: CHANGE_SPECTRUM_DISPLAY_VIEW_MODE,
      flag: flag,
    });
  }, [dispatch, isStacked]);

  const changeSpectrumViewHandler = useCallback(() => {
    dispatch({
      type: TOGGLE_REAL_IMAGINARY_VISIBILITY,
      isRealSpectrumVisible: !isRealSpectrumShown,
    });
    setIsRealSpectrumShown(!isRealSpectrumShown);
  }, [dispatch, isRealSpectrumShown]);

  const alignSpectrumsVerticallyHandler = useCallback(() => {
    dispatch({
      type: SET_SPECTRUMS_VERTICAL_ALIGN,
      flag: !verticalAlign.flag,
    });
  }, [dispatch, verticalAlign.flag]);

  const handleOnKeyPressed = useCallback(
    (e) => {
      if (
        e.target.localName !== 'input' &&
        !e.shiftKey &&
        !e.metaKey &&
        !e.ctrlKey
      ) {
        switch (e.key) {
          case 'f':
            handleFullZoomOut();
            break;
          case 'c':
            alignSpectrumsVerticallyHandler();
            break;
          case 's':
            handleChangeDisplayViewMode();
            break;
          default:
        }
      }

      if (!e.shiftKey && (e.metaKey || e.ctrlKey)) {
        switch (e.key) {
          case 'c':
            saveToClipboardHandler();
            e.preventDefault();
            break;
          case 's':
            saveAsJSONHandler();
            e.preventDefault();
            break;
          default:
        }
      }
    },
    [
      handleFullZoomOut,
      alignSpectrumsVerticallyHandler,
      handleChangeDisplayViewMode,
      saveAsJSONHandler,
      saveToClipboardHandler,
    ],
  );

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

      <MenuButton
        style={styles}
        component={<FaFileExport />}
        toolTip="Export As"
      >
        <button type="button" css={menuButton} onClick={saveAsSVGHandler}>
          <FaDownload />
          <span>Export as SVG</span>
        </button>
        <button type="button" css={menuButton} onClick={saveAsPNGHandler}>
          <FaFileImage />
          <span>Export as PNG</span>
        </button>
        <button type="button" css={menuButton} onClick={saveAsJSONHandler}>
          <FaFileDownload />
          <span>Save data ( Press Ctrl + S )</span>
        </button>
        <button type="button" css={menuButton} onClick={saveToClipboardHandler}>
          <FaCopy />
          <span>Copy image to Clipboard ( Press Ctrl + C )</span>
        </button>
      </MenuButton>

      {isViewButtonVisible && spectrumsCount > 1 && (
        <button
          type="button"
          css={[styles, { display: 'block' }]}
          onClick={handleChangeDisplayViewMode}
          className={
            !isStacked ? 'ci-icon-nmr-overlay3-aligned' : 'ci-icon-nmr-overlay3'
          }
        >
          <ToolTip title="Spectra alignment" popupPlacement="right">
            <div />
            {/* {verticalAlign !== 0 ? <FaMinus /> : <FaBars />} */}
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

      <button
        css={styles}
        type="button"
        onClick={alignSpectrumsVerticallyHandler}
      >
        <ToolTip
          title={!verticalAlign.flag ? 'Align Center' : 'Bottom Align'}
          popupPlacement="right"
        >
          {!verticalAlign.flag ? 'CA' : 'BA'}
        </ToolTip>
      </button>
    </Fragment>
  );
};

export default BasicToolBar;
