import React, { useState, useEffect, useCallback, memo } from 'react';
import { FaSearchPlus } from 'react-icons/fa';

import { useDispatch } from '../context/DispatchContext';
import {
  SET_SELECTED_TOOL,
  APPLY_FFT_FILTER,
  SET_SELECTED_FILTER,
} from '../reducer/Actions';
import { useChartData } from '../context/ChartContext';
import ToolTip from '../elements/ToolTip/ToolTip';
import { ToggleButton, ToggleButtonGroup } from '../elements/toggle';
import { Filters } from '../../data/data1d/filter1d/Filters';

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
};

const FunctionToolBar = ({ defaultValue }) => {
  const [option, setOption] = useState();
  const [selectedSpectrumInfo, setSelectedSpectrumInfo] = useState();

  const dispatch = useDispatch();
  const handleChangeOption = useCallback(
    (selectedTool) => dispatch({ type: SET_SELECTED_TOOL, selectedTool }),
    [dispatch],
  );

  const { activeSpectrum, data } = useChartData();

  const handleChange = useCallback(
    (selectedOption) => {
      setOption(selectedOption);
      handleChangeOption(selectedOption);
    },
    [handleChangeOption],
  );

  const handleOnKeyPressed = useCallback(
    (e) => {
      if (e.target?.localName !== 'input' && !e.shiftKey && !e.metaKey) {
        switch (e.key) {
          case 'z':
          case 'Escape':
            setOption(options.zoom.id);
            handleChangeOption(options.zoom.id);
            break;
          case 'p':
            setOption(options.peakPicking.id);
            handleChangeOption(options.peakPicking.id);
            break;
          case 'i':
            setOption(options.integral.id);
            handleChangeOption(options.integral.id);
            break;
          default:
        }
      }
    },
    [handleChangeOption],
  );

  useEffect(() => {
    setOption(defaultValue);
    document.addEventListener('keydown', handleOnKeyPressed, false);
    return () => {
      document.removeEventListener('keydown', handleOnKeyPressed, false);
    };
  }, [defaultValue, handleOnKeyPressed]);

  useEffect(() => {
    if (data && activeSpectrum) {
      const { info } = data.find((d) => d.id === activeSpectrum.id);
      setSelectedSpectrumInfo({ info });
    } else {
      setSelectedSpectrumInfo({ info: { isComplex: false, isFid: false } });
    }
  }, [activeSpectrum, data]);

  const handleOnFFTFilter = useCallback(() => {
    dispatch({
      type: APPLY_FFT_FILTER,
      value: '',
    });
    dispatch({ type: SET_SELECTED_FILTER, selectedFilter: null });
  }, [dispatch]);

  return (
    <>
      <ToggleButtonGroup value={option} onChange={handleChange}>
        <ToggleButton key={options.zoom.id} value={options.zoom.id}>
          <ToolTip
            title={`${options.zoom.label} ( Press z )`}
            popupPlacement="right"
            offset={{ x: 10, y: 0 }}
          >
            <FaSearchPlus />
          </ToolTip>
        </ToggleButton>

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
        >
          <ToolTip
            title={`${options.peakPicking.label} ( Press p )`}
            popupPlacement="right"
            offset={{ x: 10, y: 0 }}
          />
        </ToggleButton>

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
        >
          <ToolTip
            title={`${options.integral.label} ( Press i )`}
            popupPlacement="right"
            offset={{ x: 10, y: 0 }}
          />
        </ToggleButton>

        <ToggleButton
          key={options.autoRangesPicking.id}
          value={options.autoRangesPicking.id}
          className="ci-icon-nmr-range-picking"
          style={styles.icon}
          isVisible={
            activeSpectrum &&
            selectedSpectrumInfo &&
            !selectedSpectrumInfo.info.isFid
          }
        >
          <ToolTip
            title={options.autoRangesPicking.label}
            popupPlacement="right"
            offset={{ x: 10, y: 0 }}
          />
        </ToggleButton>

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
      </ToggleButtonGroup>

      {selectedSpectrumInfo && Filters.fft.isApplicable(selectedSpectrumInfo) && (
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

export default memo(FunctionToolBar);

FunctionToolBar.defaultProps = {
  defaultValue: options.zoom.id,
};
