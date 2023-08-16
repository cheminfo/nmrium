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
import { Toolbar } from 'react-science/ui';

import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import ToggleButton from '../elements/toggle/ToggleButton';
import ToggleButtonGroup from '../elements/toggle/ToggleButtonGroup';
import { useCheckToolsVisibility } from '../hooks/useCheckToolsVisibility';
import useDatumWithSpectraStatistics from '../hooks/useDatumWithSpectraStatistics';
import useToolsFunctions from '../hooks/useToolsFunctions';

import { options } from './ToolTypes';

interface FunctionToolBarInnerProps {
  defaultValue: string;
  ftCounter: number;
}

function FunctionToolBarInner({
  defaultValue,
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
      type: 'APPLY_FFT_FILTER',
    });
  }, [dispatch]);

  const handleFFtDimension1Filter = useCallback(() => {
    dispatch({
      type: 'APPLY_FFT_DIMENSION_1_FILTER',
    });
  }, [dispatch]);

  const handleFFtDimension2Filter = useCallback(() => {
    dispatch({
      type: 'APPLY_FFT_DIMENSION_2_FILTER',
    });
  }, [dispatch]);

  return (
    <>
      <ToggleButtonGroup value={option} onChange={handleChange}>
        {isButtonVisible('zoom') && (
          <ToggleButton
            key={options.zoom.id}
            value={options.zoom.id}
            id={options.zoom.id}
            title={`${options.zoom.label}`}
          >
            <FaSearchPlus />
          </ToggleButton>
        )}

        {isButtonVisible('zoomOut') && (
          <Toolbar.Item
            id="zoom-out"
            onClick={handleFullZoomOut}
            title="Horizontal zoom out ( Press f ), Horizontal and Vertical zoom out, double click ( Press ff )"
          >
            <FaExpand />
          </Toolbar.Item>
        )}

        {isButtonVisible('peakPicking') && (
          <ToggleButton
            key={options.peakPicking.id}
            value={options.peakPicking.id}
            title={`${options.peakPicking.label} ( Press p )`}
            id={options.peakPicking.id}
          >
            <SvgNmrPeakPicking />
          </ToggleButton>
        )}
        {isButtonVisible('integral') && (
          <ToggleButton
            key={options.integral.id}
            value={options.integral.id}
            id={options.integral.id}
            title={`${options.integral.label} ( Press i )`}
          >
            <SvgNmrIntegrate />
          </ToggleButton>
        )}
        {isButtonVisible('zonePicking') && (
          <ToggleButton
            key={options.zonePicking.id}
            value={options.zonePicking.id}
            id={options.zonePicking.id}
            title={`${options.zonePicking.label} ( Press r )`}
          >
            <FaDiceFour />
          </ToggleButton>
        )}
        {isButtonVisible('slicing') && (
          <ToggleButton
            key={options.slicing.id}
            value={options.slicing.id}
            id={options.slicing.id}
            title={`${options.slicing.label}`}
          >
            <p>Slic</p>
          </ToggleButton>
        )}
        {isButtonVisible('rangePicking') && (
          <ToggleButton
            key={options.rangePicking.id}
            value={options.rangePicking.id}
            title={`${options.rangePicking.label} ( Press r )`}
            id={options.rangePicking.id}
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
              id={options.multipleSpectraAnalysis.id}
              title={options.multipleSpectraAnalysis.label}
            >
              <SvgNmrMultipleAnalysis />
            </ToggleButton>
          )}
        {isButtonVisible('apodization') && (
          <ToggleButton
            key={options.apodization.id}
            value={options.apodization.id}
            id={options.apodization.id}
            title={`${options.apodization.label} (Press a)`}
          >
            <SvgNmrApodization />
          </ToggleButton>
        )}
        {isButtonVisible('zeroFilling') && (
          <ToggleButton
            key={options.zeroFilling.id}
            value={options.zeroFilling.id}
            id={options.zeroFilling.id}
            title={`${options.zeroFilling.label} ( Press z )`}
          >
            <SvgNmrZeroFilling />
          </ToggleButton>
        )}
        {isButtonVisible('phaseCorrection') && (
          <ToggleButton
            key={options.phaseCorrection.id}
            value={options.phaseCorrection.id}
            id={options.phaseCorrection.id}
            title={`${options.phaseCorrection.label} ( Press a )`}
          >
            <SvgNmrPhaseCorrection />
          </ToggleButton>
        )}

        {isButtonVisible('baselineCorrection') && (
          <ToggleButton
            key={options.baselineCorrection.id}
            value={options.baselineCorrection.id}
            id={options.baselineCorrection.id}
            title={`${options.baselineCorrection.label} ( Press b )`}
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
              id={options.exclusionZones.id}
            >
              <div style={{ fontSize: 18 }}>
                <SvgNmrMultipleAnalysis />
              </div>
            </ToggleButton>
          )}
      </ToggleButtonGroup>

      {isButtonVisible('fft') && (
        <Toolbar.Item
          id={options.fft.id}
          className="cheminfo"
          title={`${options.fft.label} ( Press t )`}
          onClick={handleOnFFTFilter}
        >
          <SvgNmrFourierTransform />
        </Toolbar.Item>
      )}
      {isButtonVisible('fftDimension1') && (
        <Toolbar.Item
          id={options.fftDimension1.id}
          className="cheminfo"
          title={options.fftDimension1.label}
          onClick={handleFFtDimension1Filter}
        >
          <SvgNmrFourierTransform />
        </Toolbar.Item>
      )}
      {isButtonVisible('fftDimension2') && (
        <Toolbar.Item
          id={options.fftDimension2.id}
          className="cheminfo"
          title={options.fftDimension2.label}
          onClick={handleFFtDimension2Filter}
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
  const { displayerMode } = useChartData();

  const data = useDatumWithSpectraStatistics();

  return (
    <MemoizedFunctionToolBar
      {...{
        ...data,
        displayerMode,
        defaultValue,
      }}
    />
  );
}
