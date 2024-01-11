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
import { NMRiumToolBarPreferences } from 'nmr-load-save';
import { useState, useEffect, useCallback, memo } from 'react';
import { FaSearchPlus, FaExpand, FaDiceFour } from 'react-icons/fa';
import { PiKnifeBold } from 'react-icons/pi';
import { Toolbar, ToolbarItemProps } from 'react-science/ui';

import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import {
  CheckOptions,
  useCheckToolsVisibility,
} from '../hooks/useCheckToolsVisibility';
import useDatumWithSpectraStatistics from '../hooks/useDatumWithSpectraStatistics';
import useToolsFunctions from '../hooks/useToolsFunctions';

import { options } from './ToolTypes';

interface FunctionToolBarInnerProps {
  defaultValue: string;
  ftCounter: number;
}

interface ToolItemConfig {
  id: keyof NMRiumToolBarPreferences;
  label: string;
  onClick?: () => void;
  icon: ToolbarItemProps['icon'];
  checkOptions?: CheckOptions;
  condition?: boolean;
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

  const toolItems: ToolItemConfig[] = [
    {
      id: 'zoom',
      label: options.zoom.label,
      icon: <FaSearchPlus />,
    },
    {
      id: 'zoomOut',
      label:
        'Horizontal zoom out ( Press f ), Horizontal and Vertical zoom out, double click ( Press ff )',
      onClick: handleFullZoomOut,
      icon: <FaExpand />,
    },
    {
      id: 'peakPicking',
      label: `${options.peakPicking.label} ( Press p )`,
      icon: <SvgNmrPeakPicking />,
    },
    {
      id: 'integral',
      label: `${options.integral.label} ( Press i )`,
      icon: <SvgNmrIntegrate />,
    },
    {
      id: 'zonePicking',
      label: `${options.zonePicking.label} ( Press r )`,
      icon: <FaDiceFour />,
    },
    {
      id: 'slicing',
      label: options.slicing.label,
      icon: <PiKnifeBold />,
    },
    {
      id: 'rangePicking',
      label: `${options.rangePicking.label} ( Press r )`,
      icon: <SvgNmrRangePicking />,
    },
    {
      id: 'multipleSpectraAnalysis',
      label: options.multipleSpectraAnalysis.label,
      icon: <SvgNmrMultipleAnalysis />,
      checkOptions: { checkSpectrumType: false },
      condition: ftCounter > 1,
    },
    {
      id: 'apodization',
      label: `${options.apodization.label} (Press a)`,
      icon: <SvgNmrApodization />,
    },
    {
      id: 'zeroFilling',
      label: `${options.zeroFilling.label} ( Press z )`,
      icon: <SvgNmrZeroFilling />,
    },
    {
      id: 'phaseCorrection',
      label: `${options.phaseCorrection.label} ( Press a )`,
      icon: <SvgNmrPhaseCorrection />,
    },
    {
      id: 'phaseCorrectionTwoDimensions',
      label: `${options.phaseCorrectionTwoDimensions.label} ( Press a )`,
      icon: <SvgNmrPhaseCorrection />,
    },
    {
      id: 'baselineCorrection',
      label: `${options.baselineCorrection.label} ( Press b )`,
      icon: <SvgNmrBaselineCorrection />,
    },
    {
      id: 'exclusionZones',
      label: `${options.exclusionZones.label} ( Press e )`,
      icon: <SvgNmrMultipleAnalysis />,
      checkOptions: { checkSpectrumType: false },
      condition: ftCounter > 0,
    },
    {
      id: 'fft',
      label: `${options.fft.label} ( Press t )`,
      onClick: handleOnFFTFilter,
      icon: <SvgNmrFourierTransform />,
    },
    {
      id: 'fftDimension1',
      label: options.fftDimension1.label,
      onClick: handleFFtDimension1Filter,
      icon: <SvgNmrFourierTransform />,
    },
    {
      id: 'fftDimension2',
      label: options.fftDimension2.label,
      onClick: handleFFtDimension2Filter,
      icon: <SvgNmrFourierTransform />,
    },
  ];

  return (
    <>
      {toolItems.map((item) => {
        const { id, icon, label, checkOptions, onClick, condition } = item;

        return (
          isButtonVisible(id, checkOptions) &&
          (condition === undefined || condition) && (
            <Toolbar.Item
              key={id}
              onClick={onClick || (() => handleChange(id))}
              title={label}
              id={id}
              active={option === id}
              icon={icon}
            />
          )
        );
      })}
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
