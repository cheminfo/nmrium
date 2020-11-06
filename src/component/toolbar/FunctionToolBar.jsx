import lodash from 'lodash';
import React, { useState, useEffect, useCallback, memo } from 'react';
import { useAlert } from 'react-alert';
import { FaSearchPlus, FaExpand, FaDiceFour } from 'react-icons/fa';

import { Filters } from '../../data/data1d/filter1d/Filters';
import { useDispatch } from '../context/DispatchContext';
import { usePreferences } from '../context/PreferencesContext';
import { useHelp } from '../elements/Help/Context';
import ToolTip from '../elements/ToolTip/ToolTip';
import { ToggleButton, ToggleButtonGroup } from '../elements/toggle';
import ToolBarWrapper from '../hoc/ToolBarWrapper';
import { ZoomType } from '../reducer/actions/Zoom';
import { DISPLAYER_MODE } from '../reducer/core/Constants';
import {
  SET_SELECTED_TOOL,
  APPLY_FFT_FILTER,
  SET_SELECTED_FILTER,
  FULL_ZOOM_OUT,
} from '../reducer/types/Types';

import { options } from './ToolTypes';

const styles = {
  icon: {
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '18px 18px',
  },
  button: {
    backgroundColor: 'transparent',
    border: 'none',
    width: '35px',
    height: '35px',
    outline: 'outline',
  },
  faIcon: {
    display: 'flex',
    justifyContent: 'center',
  },
};

let debounceClickEvents = [];

const FunctionToolBar = ({
  defaultValue,
  activeSpectrum,
  info,
  displayerMode,
}) => {
  const [option, setOption] = useState();
  const help = useHelp();
  const alert = useAlert();
  const preferences = usePreferences();

  const dispatch = useDispatch();

  const selectedSpectrumInfo = {
    info: { isComplex: false, isFid: false, ...info },
  };
  const handleChangeOption = useCallback(
    (selectedTool) => {
      if (
        [
          options.peakPicking.id,
          options.integral.id,
          options.zone2D.id,
        ].includes(selectedTool)
      ) {
        alert.show(
          'Press Shift + Left Mouse button to select zone for integral and peak picking',
        );
      }
      dispatch({ type: SET_SELECTED_TOOL, selectedTool });
    },
    [alert, dispatch],
  );

  const handleChange = useCallback(
    (selectedOption) => {
      setOption(selectedOption);
      handleChangeOption(selectedOption);
    },
    [handleChangeOption],
  );

  const handleFullZoomOut = useCallback(() => {
    if (debounceClickEvents.length === 0) {
      dispatch({
        type: FULL_ZOOM_OUT,
        zoomType: ZoomType.HORIZONTAL,
      });
    }
    const callback = lodash.debounce(() => {
      debounceClickEvents = [];
    }, 500);
    debounceClickEvents.push(callback);

    callback();

    if (debounceClickEvents.length > 1) {
      lodash.map(debounceClickEvents, (debounce) => debounce.cancel());
      debounceClickEvents = [];
      dispatch({
        type: FULL_ZOOM_OUT,
      });
    }
  }, [dispatch]);

  const handleOnKeyPressed = useCallback(
    (e) => {
      if (e.target.localName !== 'input' && !e.shiftKey && !e.metaKey) {
        switch (e.key) {
          case 'f':
            handleFullZoomOut();
            break;
          case 'z':
          case 'Escape':
            setOption(options.zoom.id);
            handleChangeOption(options.zoom.id);
            break;
          case 'r':
            setOption(options.rangesPicking.id);
            handleChangeOption(options.rangesPicking.id);
            break;
          case 'b':
            setOption(options.baseLineCorrection.id);
            handleChangeOption(options.baseLineCorrection.id);
            break;
          case 'p':
            setOption(options.peakPicking.id);
            handleChangeOption(options.peakPicking.id);
            break;
          case 'i': {
            const toolID =
              displayerMode === DISPLAYER_MODE.DM_2D
                ? options.zone2D.id
                : displayerMode === DISPLAYER_MODE.DM_1D
                ? options.integral.id
                : '';
            setOption(toolID);
            handleChangeOption(toolID);
            break;
          }
          case 'a':
            setOption(options.phaseCorrection.id);
            handleChangeOption(options.phaseCorrection.id);
            break;
          default:
        }
      }
    },
    [displayerMode, handleChangeOption, handleFullZoomOut],
  );

  useEffect(() => {
    setOption(defaultValue);
    document.addEventListener('keydown', handleOnKeyPressed, false);
    return () => {
      document.removeEventListener('keydown', handleOnKeyPressed, false);
    };
  }, [defaultValue, handleOnKeyPressed]);

  const handleOnFFTFilter = useCallback(() => {
    dispatch({
      type: APPLY_FFT_FILTER,
      value: '',
    });
    dispatch({ type: SET_SELECTED_FILTER, selectedFilter: null });
  }, [dispatch]);

  const isButtonVisible = useCallback(
    (key) => {
      return !lodash.get(preferences, `toolsBarButtons.${key}`);
    },
    [preferences],
  );

  return (
    <>
      <ToggleButtonGroup value={option} onChange={handleChange}>
        {isButtonVisible('hideZoomTool') && (
          <ToggleButton
            key={options.zoom.id}
            value={options.zoom.id}
            {...help.onHover}
            helpID="zoomIn"
          >
            <ToolTip
              title={`${options.zoom.label} ( Press z )`}
              popupPlacement="right"
              offset={{ x: 10, y: 0 }}
            >
              <FaSearchPlus />
            </ToolTip>
          </ToggleButton>
        )}

        {isButtonVisible('hideZoomOutTool') && (
          <button
            type="button"
            style={{ ...styles.button, ...styles.faIcon }}
            onClick={handleFullZoomOut}
          >
            <ToolTip
              title="Horizontal zoom out ( Press f ), Horizontal and Vertical zoom out, double click ( Press ff )"
              popupPlacement="right"
            >
              <FaExpand />
            </ToolTip>
          </button>
        )}

        {displayerMode === DISPLAYER_MODE.DM_1D &&
          isButtonVisible('hidePeakTool') && (
            <ToggleButton
              key={options.peakPicking.id}
              value={options.peakPicking.id}
              className="ci-icon-nmr-peak-picking"
              style={styles.icon}
              isVisible={
                activeSpectrum &&
                selectedSpectrumInfo &&
                !selectedSpectrumInfo.info.isFid
              }
              {...help.onHover}
              helpID="peakPicking"
            >
              <ToolTip
                title={`${options.peakPicking.label} ( Press p )`}
                popupPlacement="right"
                offset={{ x: 10, y: 0 }}
              />
            </ToggleButton>
          )}
        {displayerMode === DISPLAYER_MODE.DM_1D &&
          isButtonVisible('hideIntegralTool') && (
            <ToggleButton
              key={options.integral.id}
              value={options.integral.id}
              className="ci-icon-nmr-integrate"
              style={styles.icon}
              isVisible={
                activeSpectrum &&
                selectedSpectrumInfo &&
                !selectedSpectrumInfo.info.isFid
              }
              {...help.onHover}
              helpID="integralPicking"
            >
              <ToolTip
                title={`${options.integral.label} ( Press i )`}
                popupPlacement="right"
                offset={{ x: 10, y: 0 }}
              />
            </ToggleButton>
          )}
        {displayerMode === DISPLAYER_MODE.DM_2D &&
          isButtonVisible('hideIntegralTool') && (
            <ToggleButton key={options.zone2D.id} value={options.zone2D.id}>
              <ToolTip
                title={`${options.zone2D.label} ( Press i  )`}
                popupPlacement="right"
                offset={{ x: 10, y: 0 }}
              >
                <FaDiceFour />
              </ToolTip>
            </ToggleButton>
          )}
        {displayerMode === DISPLAYER_MODE.DM_2D && (
          <ToggleButton
            key={options.slicingTool.id}
            value={options.slicingTool.id}
            style={styles.icon}
          >
            <ToolTip
              title={`${options.slicingTool.label}`}
              popupPlacement="right"
              offset={{ x: 10, y: 0 }}
            >
              Slic
            </ToolTip>
          </ToggleButton>
        )}
        {displayerMode === DISPLAYER_MODE.DM_1D &&
          isButtonVisible('hideAutoRangesTool') && (
            <ToggleButton
              key={options.rangesPicking.id}
              value={options.rangesPicking.id}
              className="ci-icon-nmr-range-picking"
              style={styles.icon}
              isVisible={
                activeSpectrum &&
                selectedSpectrumInfo &&
                !selectedSpectrumInfo.info.isFid
              }
            >
              <ToolTip
                title={options.rangesPicking.label}
                popupPlacement="right"
                offset={{ x: 10, y: 0 }}
              />
            </ToggleButton>
          )}
        {displayerMode === DISPLAYER_MODE.DM_1D &&
          isButtonVisible('hideMultipleSpectraAnalysisTool') && (
            <ToggleButton
              key={options.multipleSpectraAnalysis.id}
              value={options.multipleSpectraAnalysis.id}
              className="ci-icon-nmr-multiple-analysis"
              style={styles.icon}
            >
              <ToolTip
                title={options.multipleSpectraAnalysis.label}
                popupPlacement="right"
                offset={{ x: 10, y: 0 }}
              />
            </ToggleButton>
          )}
        {displayerMode === DISPLAYER_MODE.DM_1D &&
          isButtonVisible('hideZeroFillingTool') && (
            <ToggleButton
              key={options.zeroFilling.id}
              value={options.zeroFilling.id}
              className="ci-icon-nmr-zero-filling"
              style={styles.icon}
              isVisible={
                selectedSpectrumInfo &&
                Filters.zeroFilling.isApplicable(selectedSpectrumInfo)
              }
            >
              <ToolTip
                title={options.zeroFilling.label}
                popupPlacement="right"
                offset={{ x: 10, y: 0 }}
              />
            </ToggleButton>
          )}
        {displayerMode === DISPLAYER_MODE.DM_1D &&
          isButtonVisible('hidePhaseCorrectionTool') && (
            <ToggleButton
              key={options.phaseCorrection.id}
              value={options.phaseCorrection.id}
              className="ci-icon-nmr-phase-correction"
              style={styles.icon}
              isVisible={
                activeSpectrum &&
                selectedSpectrumInfo &&
                Filters.phaseCorrection.isApplicable(selectedSpectrumInfo)
              }
            >
              <ToolTip
                title={options.phaseCorrection.label}
                popupPlacement="right"
                offset={{ x: 10, y: 0 }}
              />
            </ToggleButton>
          )}

        {displayerMode === DISPLAYER_MODE.DM_1D &&
          isButtonVisible('hideBaseLineCorrectionTool') && (
            <ToggleButton
              key={options.baseLineCorrection.id}
              value={options.baseLineCorrection.id}
              className="ci-icon-nmr-base-line-correction"
              style={styles.icon}
              isVisible={
                activeSpectrum &&
                selectedSpectrumInfo &&
                Filters.baselineCorrection.isApplicable(selectedSpectrumInfo)
              }
            >
              <ToolTip
                title={options.baseLineCorrection.label}
                popupPlacement="right"
                offset={{ x: 10, y: 0 }}
              >
                BLC
              </ToolTip>
            </ToggleButton>
          )}
      </ToggleButtonGroup>

      {displayerMode === DISPLAYER_MODE.DM_1D &&
        isButtonVisible('hideFFTTool') &&
        selectedSpectrumInfo &&
        Filters.fft.isApplicable(selectedSpectrumInfo) && (
          <button
            className="ci-icon-nmr-fourier-transform"
            style={{ ...styles.icon, ...styles.button }}
            type="button"
            onClick={handleOnFFTFilter}
          >
            <ToolTip
              title={`FFT Filter`}
              popupPlacement="right"
              offset={{ x: 10, y: 0 }}
            />
          </button>
        )}
    </>
  );
};

export default ToolBarWrapper(memo(FunctionToolBar));

FunctionToolBar.defaultProps = {
  defaultValue: options.zoom.id,
};
