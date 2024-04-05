import {
  SvgNmrAlignBottom,
  SvgNmrAlignCenter,
  SvgNmrApodization,
  SvgNmrBaselineCorrection,
  SvgNmrFourierTransform,
  SvgNmrIntegrate,
  SvgNmrMultipleAnalysis,
  SvgNmrOverlay3,
  SvgNmrOverlay3Aligned,
  SvgNmrPeakPicking,
  SvgNmrPhaseCorrection,
  SvgNmrRangePicking,
  SvgNmrRealImag,
  SvgNmrZeroFilling,
} from 'cheminfo-font';
import { NMRiumToolBarPreferences } from 'nmr-load-save';
import { useCallback } from 'react';
import {
  FaSearchPlus,
  FaExpand,
  FaDiceFour,
  FaFileImport,
  FaFileExport,
} from 'react-icons/fa';
import { PiKnifeBold } from 'react-icons/pi';
import { Toolbar, ToolbarItemProps } from 'react-science/ui';

import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import { useLoader } from '../context/LoaderContext';
import { CustomToolTip, ToolTipItem } from '../elements/CustomToolTip';
import {
  ToolbarPopoverMenuItem,
  ToolbarPopoverItem,
} from '../elements/ToolbarPopoverItem';
import useCheckExperimentalFeature from '../hooks/useCheckExperimentalFeature';
import {
  CheckOptions,
  useCheckToolsVisibility,
} from '../hooks/useCheckToolsVisibility';
import useDatumWithSpectraStatistics from '../hooks/useDatumWithSpectraStatistics';
import { useDialogToggle } from '../hooks/useDialogToggle';
import useExport from '../hooks/useExport';
import useToolsFunctions from '../hooks/useToolsFunctions';
import { useVerticalAlign } from '../hooks/useVerticalAlign';
import { ImportPublicationStringModal } from '../modal/ImportPublicationStringModal';
import { LoadJCAMPModal } from '../modal/LoadJCAMPModal';
import SaveAsModal from '../modal/SaveAsModal';
import { MetaImportationModal } from '../modal/metaImportation/MetaImportationModal';

import { options } from './ToolTypes';
import { EXPORT_MENU, IMPORT_MENU } from './toolbarMenu';

interface BaseToolItem extends Pick<ToolbarItemProps, 'icon'> {
  id: keyof NMRiumToolBarPreferences;
  checkOptions?: CheckOptions;
  condition?: boolean;
}
interface ToolItem extends BaseToolItem {
  onClick?: () => void;
  tooltip: string | ToolTipItem;
}
interface PopoverToolItem extends BaseToolItem {
  onClick: (data?: any) => void;
  menuItems: ToolbarPopoverMenuItem[];
  tooltip: string | ToolTipItem;
}

function isPopoverToolItem(
  item: ToolItem | PopoverToolItem,
): item is PopoverToolItem {
  return !!(item as PopoverToolItem)?.menuItems;
}

export default function ToolBar() {
  const {
    toolOptions: { selectedTool },
  } = useChartData();
  const isButtonVisible = useCheckToolsVisibility();
  const dispatch = useDispatch();

  const {
    isRealSpectrumShown,
    changeSpectrumViewHandler,
    changeDisplayViewModeHandler,
    alignSpectraVerticallyHandler,
    handleChangeOption,
    handleFullZoomOut,
  } = useToolsFunctions();

  const handleChange = useCallback(
    (selectedOption) => {
      handleChangeOption(selectedOption);
    },
    [handleChangeOption],
  );

  const openLoader = useLoader();
  const isExperimentalFeature = useCheckExperimentalFeature();

  const { dialog, closeDialog, openDialog } = useDialogToggle({
    loadJCAMP: false,
    importPublicationString: false,
    metaImportation: false,
    saveAs: false,
  });

  const verticalAlign = useVerticalAlign();

  const { fidCounter, ftCounter } = useDatumWithSpectraStatistics();

  const importMenu = isExperimentalFeature
    ? IMPORT_MENU
    : IMPORT_MENU.filter((item) => item.id !== 'importPublicationString');

  const exportMenu = isExperimentalFeature
    ? EXPORT_MENU
    : EXPORT_MENU.filter((item) => item.id !== 'nmre');

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

  const {
    saveAsSVGHandler,
    saveAsPNGHandler,
    saveAsJSONHandler,
    saveToClipboardHandler,
  } = useExport();

  function importHandler(data) {
    switch (data?.id) {
      case 'importFile':
        openLoader();
        break;
      case 'importJDX':
        openDialog('loadJCAMP');
        break;
      case 'importPublicationString':
        openDialog('importPublicationString');
        break;
      case 'importMetaInformation':
        openDialog('metaImportation');
        break;
      default:
    }
  }

  function exportHandler(data) {
    switch (data?.id) {
      case 'svg':
        void saveAsSVGHandler();
        break;
      case 'png':
        void saveAsPNGHandler();
        break;
      case 'json':
        saveAsJSONHandler();
        break;
      case 'advance_save':
        openDialog('saveAs');
        break;
      case 'copy':
        void saveToClipboardHandler();
        break;

      default:
        break;
    }
  }

  const toolItems: Array<ToolItem | PopoverToolItem> = [
    {
      id: 'zoom',
      tooltip: {
        title: options.zoom.label,
        subTitles: [
          { title: 'Vertical', shortcuts: ['Scroll wheel'] },
          { title: 'Horizontal', shortcuts: ['Shift', 'Scroll wheel'] },
          { title: 'Pan', shortcuts: ['Right mouse'] },
        ],
      },
      icon: <FaSearchPlus />,
    },
    {
      id: 'zoomOut',
      tooltip: {
        title: 'Zoom out',
        subTitles: [
          { title: 'Horizontal', shortcuts: ['f'] },
          { title: 'Horizontal and Vertical', shortcuts: ['f', 'f'] },
        ],
        description:
          'You can zoom out by double click on the left mouse button and full zoom out by press key "f" or press key "f" twice to fit the spectra in the window.',
        link: 'https://docs.nmrium.org/help/zoom-and-scale',
      },
      onClick: handleFullZoomOut,
      icon: <FaExpand />,
    },
    {
      id: 'peakPicking',
      tooltip: {
        title: options.peakPicking.label,
        shortcuts: ['p'],
        description:
          'You can detect peaks manually or automatically in the spectrum.',
        link: 'https://docs.nmrium.org/20_1d-spectra/peaks/peaks',
      },

      icon: <SvgNmrPeakPicking />,
    },
    {
      id: 'integral',
      tooltip: {
        title: options.integral.label,
        shortcuts: ['i'],
        description:
          'To calculate the integration, hold Shift and left-click, then drag over the signal range.',
        link: 'https://docs.nmrium.org/help/integrations',
      },
      icon: <SvgNmrIntegrate />,
    },
    {
      id: 'zonePicking',
      tooltip: {
        title: options.zonePicking.label,
        shortcuts: ['r'],
        description:
          'You can detect zones manually by selecting, holding Shift,left-click, dragging, and then releasing. Alternatively, detect zones automatically.',
        link: 'https://docs.nmrium.org/30_2d-spectra/zones/zones',
      },
      icon: <FaDiceFour />,
    },
    {
      id: 'slicing',
      tooltip: {
        title: options.slicing.label,
        description:
          'You can display the shift on the x-axis and the y-axis for each point of a 2D spectrum.',
        link: 'https://docs.nmrium.org/30_2d-spectra/slicing/slicing',
      },
      icon: <PiKnifeBold />,
    },
    {
      id: 'rangePicking',
      tooltip: {
        title: options.rangePicking.label,
        shortcuts: ['r'],
        description:
          'You can detect ranges manually by selecting, holding Shift,left-click, dragging, and then releasing. Alternatively, detect ranges automatically.',
        link: 'https://docs.nmrium.org/20_1d-spectra/ranges/ranges',
      },
      icon: <SvgNmrRangePicking />,
    },
    {
      id: 'multipleSpectraAnalysis',
      tooltip: options.multipleSpectraAnalysis.label,
      icon: <SvgNmrMultipleAnalysis />,
      checkOptions: { checkSpectrumType: false },
      condition: ftCounter > 0,
    },
    {
      id: 'apodization',
      tooltip: {
        title: options.apodization.label,
        shortcuts: ['a'],
      },
      icon: <SvgNmrApodization />,
    },
    {
      id: 'zeroFilling',
      tooltip: {
        title: options.zeroFilling.label,
        shortcuts: ['z'],
        description:
          'To improve spectrum quality by increasing the number of points per ppm, by default, the number of points is twice as many points as in the original FID.',
        link: 'https://docs.nmrium.org/20_1d-spectra/preprocessing/preprocessing#zero-filling',
      },
      icon: <SvgNmrZeroFilling />,
    },
    {
      id: 'phaseCorrection',
      tooltip: {
        title: options.phaseCorrection.label,
        shortcuts: ['a'],
        description: 'To phase the spectrum after the FFT.',
        link: 'https://docs.nmrium.org/20_1d-spectra/phase/phase',
      },
      icon: <SvgNmrPhaseCorrection />,
    },
    {
      id: 'phaseCorrectionTwoDimensions',
      tooltip: {
        title: options.phaseCorrectionTwoDimensions.label,
        shortcuts: ['a'],
        description: 'To phase the spectrum after the FFT.',
      },
      icon: <SvgNmrPhaseCorrection />,
    },
    {
      id: 'baselineCorrection',
      tooltip: {
        title: options.baselineCorrection.label,
        shortcuts: ['b'],
        description:
          'To process the spectrum to be a straight line at zero absorbance.',
        link: 'https://docs.nmrium.org/20_1d-spectra/baseline/baseline',
      },
      icon: <SvgNmrBaselineCorrection />,
    },
    {
      id: 'exclusionZones',
      tooltip: {
        title: options.exclusionZones.label,
        shortcuts: ['e'],
      },
      icon: <SvgNmrMultipleAnalysis />,
      checkOptions: { checkSpectrumType: false },
      condition: ftCounter > 0,
    },
    {
      id: 'fft',
      tooltip: {
        title: options.fft.label,
        shortcuts: ['t'],
        description: 'To process the FID to FT spectrum.',
        link: 'https://docs.nmrium.org/20_1d-spectra/ft/ft/',
      },
      onClick: handleOnFFTFilter,
      icon: <SvgNmrFourierTransform />,
    },
    {
      id: 'fftDimension1',
      tooltip: options.fftDimension1.label,
      onClick: handleFFtDimension1Filter,
      icon: <SvgNmrFourierTransform />,
    },
    {
      id: 'fftDimension2',
      tooltip: options.fftDimension2.label,
      onClick: handleFFtDimension2Filter,
      icon: <SvgNmrFourierTransform />,
    },
    {
      id: 'import',
      tooltip: options.import.label,
      icon: <FaFileImport />,
      menuItems: importMenu,
      onClick: importHandler,
    },
    {
      id: 'exportAs',
      tooltip: options.exportAs.label,
      icon: <FaFileExport />,
      menuItems: exportMenu,
      onClick: exportHandler,
    },
    {
      id: 'spectraStackAlignments',
      tooltip: {
        title: options.spectraStackAlignments.label,
        shortcuts: ['s'],
        description: 'To display the spectra in a stack mode.',
      },
      icon:
        verticalAlign === 'stack' ? (
          <SvgNmrOverlay3Aligned />
        ) : (
          <SvgNmrOverlay3 />
        ),
      condition: ftCounter > 1,
      onClick: changeDisplayViewModeHandler,
    },
    {
      id: 'realImaginary',
      tooltip: {
        title: `Display ${isRealSpectrumShown ? 'real' : 'imaginary'}`,
        description:
          'To switch between imaginary and real part of the spectrum.',
        link: 'https://docs.nmrium.org/20_1d-spectra/views/views',
      },
      icon: <SvgNmrRealImag />,
      onClick: changeSpectrumViewHandler,
    },
    {
      id: 'spectraCenterAlignments',
      tooltip: {
        title: `Baseline ${verticalAlign === 'bottom' ? 'center' : 'bottom'}`,
        shortcuts: ['c'],
        description:
          'To align the spectra in the centre or at the bottom of the displayer.',
      },
      icon:
        verticalAlign === 'bottom' ? (
          <SvgNmrAlignCenter />
        ) : (
          <SvgNmrAlignBottom />
        ),
      condition: ftCounter > 0 || fidCounter > 0,
      onClick: alignSpectraVerticallyHandler,
    },
  ];

  return (
    <>
      <LoadJCAMPModal isOpen={dialog.loadJCAMP} onCloseDialog={closeDialog} />
      <ImportPublicationStringModal
        isOpen={dialog.importPublicationString}
        onClose={closeDialog}
      />
      <MetaImportationModal
        isOpen={dialog.metaImportation}
        onCloseDialog={closeDialog}
      />
      <SaveAsModal isOpen={dialog.saveAs} onCloseDialog={closeDialog} />
      <Toolbar vertical>
        {toolItems.map((item) => {
          const { id, icon, tooltip, checkOptions, condition } = item;
          const show =
            isButtonVisible(id, checkOptions) &&
            (condition === undefined || condition);

          if (!show) return null;

          if (isPopoverToolItem(item)) {
            const { menuItems, onClick } = item;
            return (
              <ToolbarPopoverItem
                key={id}
                options={menuItems}
                tooltip={
                  typeof tooltip === 'string' ? (
                    tooltip
                  ) : (
                    <CustomToolTip {...tooltip} />
                  )
                }
                tooltipProps={{
                  minimal: true,
                }}
                id={id}
                active={selectedTool === id}
                icon={icon}
                onClick={onClick}
              />
            );
          }

          const { onClick } = item;

          return (
            <Toolbar.Item
              key={id}
              onClick={onClick || (() => handleChange(id))}
              tooltip={
                typeof tooltip === 'string' ? (
                  tooltip
                ) : (
                  <CustomToolTip {...tooltip} />
                )
              }
              tooltipProps={{
                minimal: true,
              }}
              id={id}
              active={selectedTool === id}
              icon={icon}
            />
          );
        })}
      </Toolbar>
    </>
  );
}
