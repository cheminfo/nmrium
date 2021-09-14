/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
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
import lodashGet from 'lodash/get';
import { useState, useEffect, useCallback, memo } from 'react';
import { FaSearchPlus, FaExpand, FaDiceFour } from 'react-icons/fa';

import * as Filters from '../../data/Filters';
import { Info as Datum1DInfo, Data1D } from '../../data/data1d/Spectrum1D';
import { Info as Datum2DInfo, Data2D } from '../../data/data2d/Spectrum2D';
import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import { usePreferences } from '../context/PreferencesContext';
import ToggleButton from '../elements/toggle/ToggleButton';
import ToggleButtonGroup from '../elements/toggle/ToggleButtonGroup';
import useDatumWithSpectraStatistics from '../hooks/useDatumWithSpectraStatistics';
import useToolsFunctions from '../hooks/useToolsFunctions';
import { ActiveSpectrum } from '../reducer/Reducer';
import { DISPLAYER_MODE } from '../reducer/core/Constants';
import { APPLY_FFT_FILTER, SET_SELECTED_FILTER } from '../reducer/types/Types';

import { options } from './ToolTypes';

const styles = css`
  button {
    border: none;
    width: 30px;
    height: 30px;
    min-height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    outline: outline;
    :focus {
      outline: none !important;
    }

    &.fa {
      svg {
        font-size: 14px;
      }
    }
    &.cheminfo {
      svg {
        font-size: 18px;
      }
    }
  }
`;

interface FunctionToolBarInnerProps {
  defaultValue: string;
  activeSpectrum: ActiveSpectrum | null;
  ftCounter: number;
  displayerMode: DISPLAYER_MODE;
  info: Datum1DInfo | Datum2DInfo;
  datum: Data1D | Data2D;
}

function FunctionToolBarInner({
  defaultValue,
  activeSpectrum,
  info,
  datum,
  displayerMode,
  ftCounter,
}: FunctionToolBarInnerProps) {
  const [option, setOption] = useState<string>('');
  const preferences = usePreferences();

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

  const isButtonVisible = useCallback(
    (toolKey) => {
      return !lodashGet(preferences, `display.toolBarButtons.${toolKey}`);
    },
    [preferences],
  );
  const isPanelVisible = useCallback(
    (panelKey) => {
      return !lodashGet(preferences, `display.panels.${panelKey}`);
    },
    [preferences],
  );
  return (
    <div css={styles}>
      <ToggleButtonGroup value={option} onChange={handleChange}>
        {isButtonVisible('hideZoomTool') && (
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

        {isButtonVisible('hideZoomOutTool') && (
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

        {displayerMode === DISPLAYER_MODE.DM_1D &&
          isButtonVisible('hidePeakTool') && (
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
          isButtonVisible('hideIntegralTool') && (
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
          isButtonVisible('hideIntegralTool') && (
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
        {displayerMode === DISPLAYER_MODE.DM_2D && (
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
          isButtonVisible('hideAutoRangesTool') && (
            <ToggleButton
              key={options.rangesPicking.id}
              value={options.rangesPicking.id}
              isVisible={activeSpectrum && !info?.isFid ? true : false}
              title={options.rangesPicking.label}
              id="ranges-pick"
            >
              <SvgNmrRangePicking />
            </ToggleButton>
          )}
        {displayerMode === DISPLAYER_MODE.DM_1D &&
          isButtonVisible('hideMultipleSpectraAnalysisTool') &&
          ftCounter > 1 &&
          (info?.isFt || !activeSpectrum) && (
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
          isButtonVisible('hideZeroFillingTool') && (
            <ToggleButton
              key={options.zeroFilling.id}
              value={options.zeroFilling.id}
              isVisible={Filters.zeroFilling.isApplicable({ info })}
              id="zeroFilling"
              title={options.zeroFilling.label}
            >
              <SvgNmrZeroFilling />
            </ToggleButton>
          )}
        {displayerMode === DISPLAYER_MODE.DM_1D &&
          isButtonVisible('hidePhaseCorrectionTool') && (
            <ToggleButton
              key={options.phaseCorrection.id}
              value={options.phaseCorrection.id}
              id="phaseCorrection"
              title={options.phaseCorrection.label}
              isVisible={
                activeSpectrum &&
                info &&
                Filters.phaseCorrection.isApplicable({ info }) &&
                (datum as Data1D).im
                  ? true
                  : false
              }
            >
              <SvgNmrPhaseCorrection />
            </ToggleButton>
          )}

        {displayerMode === DISPLAYER_MODE.DM_1D &&
          isButtonVisible('hideBaseLineCorrectionTool') && (
            <ToggleButton
              key={options.baseLineCorrection.id}
              value={options.baseLineCorrection.id}
              id="baseLineCorrection"
              title={options.baseLineCorrection.label}
              isVisible={
                activeSpectrum &&
                info &&
                Filters.baselineCorrection.isApplicable({ info })
                  ? true
                  : false
              }
            >
              <SvgNmrBaselineCorrection />
            </ToggleButton>
          )}

        {displayerMode === DISPLAYER_MODE.DM_1D &&
          isButtonVisible('hideExclusionZonesTool') &&
          isPanelVisible('hideMultipleSpectraAnalysisPanel') &&
          !info?.isFid && (
            <ToggleButton
              key={options.exclusionZones.id}
              value={options.exclusionZones.id}
              title={options.exclusionZones.label}
              id="exclusionZones"
            >
              <div style={{ fontSize: 18 }}>
                <SvgNmrMultipleAnalysis />
              </div>
            </ToggleButton>
          )}
      </ToggleButtonGroup>

      {displayerMode === DISPLAYER_MODE.DM_1D &&
        isButtonVisible('hideFFTTool') &&
        info &&
        Filters.fft.isApplicable({ info }) && (
          <Toolbar.Item
            id="fft-filter"
            className="cheminfo"
            title="FFT Filter"
            onClick={handleOnFFTFilter}
          >
            <SvgNmrFourierTransform />
          </Toolbar.Item>
        )}
    </div>
  );
}

const MemoizedFunctionToolBar = memo(FunctionToolBarInner);

export default function FunctionToolBar({
  defaultValue = options.zoom.id,
}: {
  defaultValue?: string;
}) {
  const { activeSpectrum, verticalAlign, displayerMode, activeTab } =
    useChartData();

  const data = useDatumWithSpectraStatistics();

  return (
    <MemoizedFunctionToolBar
      {...{
        ...data,
        activeSpectrum,
        verticalAlign,
        displayerMode,
        activeTab,
        defaultValue,
      }}
    />
  );
}
