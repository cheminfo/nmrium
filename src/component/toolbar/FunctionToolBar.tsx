import { Toolbar } from 'analysis-ui-components';
import {
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
import { DISPLAYER_MODE } from '../reducer/core/Constants';
import { APPLY_FFT_FILTER, SET_SELECTED_FILTER } from '../reducer/types/Types';

import { options } from './ToolTypes';

interface FunctionToolBarInnerProps {
  defaultValue: string;
  activeSpectrum: ActiveSpectrum | null;
  ftCounter: number;
  displayerMode: DISPLAYER_MODE;
  info: Info1D | Info2D;
  datum: Data1D | Data2D;
  mode: string;
}

function FunctionToolBarInner({
  defaultValue,
  activeSpectrum,
  info,
  datum,
  displayerMode,
  ftCounter,
  mode,
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
        {isButtonVisible('zoomTool') && (
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

        {isButtonVisible('zoomOutTool') && (
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

        {displayerMode === DISPLAYER_MODE.DM_1D && isButtonVisible('peakTool') && (
          <ToggleButton
            key={options.peakPicking.id}
            value={options.peakPicking.id}
            title={`${options.peakPicking.label} ( Press p )`}
            isVisible={activeSpectrum && !info?.isFid ? true : false}
            id="peakPicking"
          >
            <SvgNmrPeakPicking />
          </ToggleButton>
        )}
        {displayerMode === DISPLAYER_MODE.DM_1D &&
          isButtonVisible('integralTool') && (
            <ToggleButton
              key={options.integral.id}
              value={options.integral.id}
              isVisible={activeSpectrum && !info?.isFid ? true : false}
              id="integralPicking"
              title={`${options.integral.label} ( Press i )`}
            >
              <SvgNmrIntegrate />
            </ToggleButton>
          )}
        {displayerMode === DISPLAYER_MODE.DM_2D &&
          isButtonVisible('zonePickingTool') && (
            <ToggleButton
              key={options.zone2D.id}
              value={options.zone2D.id}
              id="zone2d"
              isVisible={activeSpectrum && !info?.isFid ? true : false}
              title={`${options.zone2D.label} ( Press r )`}
            >
              <FaDiceFour />
            </ToggleButton>
          )}
        {displayerMode === DISPLAYER_MODE.DM_2D &&
          isButtonVisible('slicingTool') && (
            <ToggleButton
              key={options.slicingTool.id}
              value={options.slicingTool.id}
              isVisible={activeSpectrum && !info?.isFid ? true : false}
              id="slic"
              title={`${options.slicingTool.label}`}
            >
              <p>Slic</p>
            </ToggleButton>
          )}
        {displayerMode === DISPLAYER_MODE.DM_1D &&
          isButtonVisible('autoRangesTool') && (
            <ToggleButton
              key={options.rangesPicking.id}
              value={options.rangesPicking.id}
              isVisible={activeSpectrum && !info?.isFid ? true : false}
              title={`${options.rangesPicking.label} ( Press r )`}
              id="ranges-pick"
            >
              <SvgNmrRangePicking />
            </ToggleButton>
          )}
        {displayerMode === DISPLAYER_MODE.DM_1D &&
          isButtonVisible('multipleSpectraAnalysisTool') &&
          ftCounter > 1 &&
          mode === 'RTL' && (
            <ToggleButton
              key={options.multipleSpectraAnalysis.id}
              value={options.multipleSpectraAnalysis.id}
              id="multipleSpectraAnalysis"
              title={options.multipleSpectraAnalysis.label}
            >
              <SvgNmrMultipleAnalysis />
            </ToggleButton>
          )}
        {displayerMode === DISPLAYER_MODE.DM_1D &&
          isButtonVisible('zeroFillingTool') && (
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
        {displayerMode === DISPLAYER_MODE.DM_1D &&
          isButtonVisible('phaseCorrectionTool') && (
            <ToggleButton
              key={options.phaseCorrection.id}
              value={options.phaseCorrection.id}
              id="phaseCorrection"
              title={`${options.phaseCorrection.label} ( Press a )`}
              isVisible={
                activeSpectrum &&
                info &&
                Filters.phaseCorrection.isApplicable({ info } as Datum1D) &&
                (datum as Data1D).im
                  ? true
                  : false
              }
            >
              <SvgNmrPhaseCorrection />
            </ToggleButton>
          )}

        {displayerMode === DISPLAYER_MODE.DM_1D &&
          isButtonVisible('baseLineCorrectionTool') && (
            <ToggleButton
              key={options.baseLineCorrection.id}
              value={options.baseLineCorrection.id}
              id="baseLineCorrection"
              title={`${options.baseLineCorrection.label} ( Press b )`}
              isVisible={
                activeSpectrum &&
                info &&
                Filters.baselineCorrection.isApplicable({ info } as Datum1D)
                  ? true
                  : false
              }
            >
              <SvgNmrBaselineCorrection />
            </ToggleButton>
          )}

        {displayerMode === DISPLAYER_MODE.DM_1D &&
          isButtonVisible('exclusionZonesTool') &&
          !info?.isFid &&
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

      {displayerMode === DISPLAYER_MODE.DM_1D &&
        isButtonVisible('FFTTool') &&
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
  const { activeSpectrum, displayerMode, activeTab, mode } = useChartData();

  const data = useDatumWithSpectraStatistics();

  return (
    <MemoizedFunctionToolBar
      {...{
        ...data,
        activeSpectrum,
        displayerMode,
        activeTab,
        defaultValue,
        mode,
      }}
    />
  );
}
