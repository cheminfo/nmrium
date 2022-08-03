import { Toolbar } from 'analysis-ui-components';
import {
  SvgNmrApodization,
  SvgNmrBaselineCorrection,
  SvgNmrFourierTransform,
  SvgNmrIntegrate,
  SvgNmrMultipleAnalysis,
  SvgNmrPeakPicking,
  SvgNmrPhaseCorrection,
  SvgNmrRangePicking,
  SvgNmrZeroFilling,
} from 'cheminfo-font';
import { useState, useEffect, useCallback, memo } from 'react';
import { FaSearchPlus, FaExpand, FaDiceFour } from 'react-icons/fa';

import * as Filters from '../../data/Filters';
import { Info1D, Data1D } from '../../data/types/data1d';
import { Datum1D } from '../../data/types/data1d/Datum1D';
import { Info2D, Data2D } from '../../data/types/data2d';
import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import ToggleButton from '../elements/toggle/ToggleButton';
import ToggleButtonGroup from '../elements/toggle/ToggleButtonGroup';
import { useCheckToolsVisibility } from '../hooks/useCheckToolsVisibility';
import useDatumWithSpectraStatistics from '../hooks/useDatumWithSpectraStatistics';
import useToolsFunctions from '../hooks/useToolsFunctions';
import { ActiveSpectrum } from '../reducer/Reducer';
import { APPLY_FFT_FILTER, SET_SELECTED_FILTER } from '../reducer/types/Types';

import { options } from './ToolTypes';

interface FunctionToolBarInnerProps {
  defaultValue: string;
  activeSpectrum: ActiveSpectrum | null;
  ftCounter: number;
  info: Info1D | Info2D;
  datum: Data1D | Data2D;
}

function FunctionToolBarInner({
  defaultValue,
  activeSpectrum,
  info,
  datum,
  ftCounter,
}: FunctionToolBarInnerProps) {
  const [option, setOption] = useState<string>('');
  const isButtonVisible = useCheckToolsVisibility();

  const dispatch = useDispatch();

  const { handleChangeOption, handleFullZoomOut } = useToolsFunctions();

  const handleChange = useCallback(
    (selectedOption) => {
      setOption(selectedOption);
      handleChangeOption(selectedOption);
    },
    [handleChangeOption],
  );

  useEffect(() => {
    setOption(defaultValue);
  }, [defaultValue]);

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
        {isButtonVisible('zoom') && (
          <ToggleButton
            key={options.zoom.id}
            value={options.zoom.id}
            id="zoomIn"
            title={`${options.zoom.label} ( Press z )`}
          >
            <div style={{ fontSize: 14 }}>
              <FaSearchPlus />
            </div>
          </ToggleButton>
        )}

        {isButtonVisible('zoomOut') && (
          <Toolbar.Item
            id="zoom-out"
            onClick={handleFullZoomOut}
            title="Horizontal zoom out ( Press f ), Horizontal and Vertical zoom out, double click ( Press ff )"
          >
            <div style={{ fontSize: 14 }}>
              <FaExpand />
            </div>
          </Toolbar.Item>
        )}

        {isButtonVisible('peakPicking') && (
          <ToggleButton
            key={options.peakPicking.id}
            value={options.peakPicking.id}
            title={`${options.peakPicking.label} ( Press p )`}
            isVisible={!!(activeSpectrum && !info?.isFid)}
            id="peakPicking"
          >
            <SvgNmrPeakPicking />
          </ToggleButton>
        )}
        {isButtonVisible('integral') && (
          <ToggleButton
            key={options.integral.id}
            value={options.integral.id}
            isVisible={!!(activeSpectrum && !info?.isFid)}
            id="integralPicking"
            title={`${options.integral.label} ( Press i )`}
          >
            <SvgNmrIntegrate />
          </ToggleButton>
        )}
        {isButtonVisible('zonePicking') && (
          <ToggleButton
            key={options.zonePicking.id}
            value={options.zonePicking.id}
            id="zone2d"
            isVisible={!!(activeSpectrum && !info?.isFid)}
            title={`${options.zonePicking.label} ( Press r )`}
          >
            <FaDiceFour />
          </ToggleButton>
        )}
        {isButtonVisible('slicing') && (
          <ToggleButton
            key={options.slicing.id}
            value={options.slicing.id}
            isVisible={!!(activeSpectrum && !info?.isFid)}
            id="slic"
            title={`${options.slicing.label}`}
          >
            <p>Slic</p>
          </ToggleButton>
        )}
        {isButtonVisible('rangePicking') && (
          <ToggleButton
            key={options.rangePicking.id}
            value={options.rangePicking.id}
            isVisible={!!(activeSpectrum && !info?.isFid)}
            title={`${options.rangePicking.label} ( Press r )`}
            id="ranges-pick"
          >
            <SvgNmrRangePicking />
          </ToggleButton>
        )}
        {isButtonVisible('multipleSpectraAnalysis', {
          checkSpectrumType: false,
        }) &&
          ftCounter > 1 && (
            <ToggleButton
              key={options.multipleSpectraAnalysis.id}
              value={options.multipleSpectraAnalysis.id}
              id="multipleSpectraAnalysis"
              title={options.multipleSpectraAnalysis.label}
            >
              <SvgNmrMultipleAnalysis />
            </ToggleButton>
          )}
        {isButtonVisible('apodization') && (
          <ToggleButton
            key={options.apodization.id}
            value={options.apodization.id}
            isVisible={Filters.apodization.isApplicable({ info } as Datum1D)}
            id="apodization"
            title={options.apodization.label}
          >
            <SvgNmrApodization />
          </ToggleButton>
        )}
        {isButtonVisible('zeroFilling') && (
          <ToggleButton
            key={options.zeroFilling.id}
            value={options.zeroFilling.id}
            isVisible={Filters.zeroFilling.isApplicable({ info } as Datum1D)}
            id="zeroFilling"
            title={options.zeroFilling.label}
          >
            <SvgNmrZeroFilling />
          </ToggleButton>
        )}
        {isButtonVisible('phaseCorrection') && (
          <ToggleButton
            key={options.phaseCorrection.id}
            value={options.phaseCorrection.id}
            id="phaseCorrection"
            title={`${options.phaseCorrection.label} ( Press a )`}
            isVisible={
              !!(
                activeSpectrum &&
                info &&
                Filters.phaseCorrection.isApplicable({ info } as Datum1D) &&
                (datum as Data1D).im
              )
            }
          >
            <SvgNmrPhaseCorrection />
          </ToggleButton>
        )}

        {isButtonVisible('baselineCorrection') && (
          <ToggleButton
            key={options.baselineCorrection.id}
            value={options.baselineCorrection.id}
            id="baselineCorrection"
            title={`${options.baselineCorrection.label} ( Press b )`}
            isVisible={
              !!(
                activeSpectrum &&
                info &&
                Filters.baselineCorrection.isApplicable({ info } as Datum1D)
              )
            }
          >
            <SvgNmrBaselineCorrection />
          </ToggleButton>
        )}

        {isButtonVisible('exclusionZones', { checkSpectrumType: false }) &&
          ftCounter > 0 && (
            <ToggleButton
              key={options.exclusionZones.id}
              value={options.exclusionZones.id}
              title={`${options.exclusionZones.label} ( Press e )`}
              id="exclusionZones"
            >
              <div style={{ fontSize: 18 }}>
                <SvgNmrMultipleAnalysis />
              </div>
            </ToggleButton>
          )}
      </ToggleButtonGroup>

      {isButtonVisible('FFT') &&
        info &&
        Filters.fft.isApplicable({ info } as Datum1D) && (
          <Toolbar.Item
            id="fft-filter"
            className="cheminfo"
            title="FFT Filter"
            onClick={handleOnFFTFilter}
          >
            <SvgNmrFourierTransform />
          </Toolbar.Item>
        )}
    </>
  );
}

const MemoizedFunctionToolBar = memo(FunctionToolBarInner);

export default function FunctionToolBar({
  defaultValue = options.zoom.id,
}: {
  defaultValue?: string;
}) {
  const { activeSpectrum, displayerMode, activeTab } = useChartData();

  const data = useDatumWithSpectraStatistics();

  return (
    <MemoizedFunctionToolBar
      {...{
        ...data,
        activeSpectrum,
        displayerMode,
        activeTab,
        defaultValue,
      }}
    />
  );
}
