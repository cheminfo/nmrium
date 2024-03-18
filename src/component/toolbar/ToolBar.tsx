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
import ImportPublicationStringModal from '../modal/ImportPublicationStringModal';
import { LoadJCAMPModal } from '../modal/LoadJCAMPModal';
import SaveAsModal from '../modal/SaveAsModal';
import { MetaImportationModal } from '../modal/metaImportation/MetaImportationModal';

import { options } from './ToolTypes';
import { EXPORT_MENU, IMPORT_MENU } from './toolbarMenu';

interface BaseToolItem {
  id: keyof NMRiumToolBarPreferences;
  title: string;
  icon: ToolbarItemProps['icon'];
  checkOptions?: CheckOptions;
  condition?: boolean;
}
interface ToolItem extends BaseToolItem {
  onClick?: () => void;
}
interface PopoverToolItem extends BaseToolItem {
  onClick: (data?: any) => void;
  menuItems: ToolbarPopoverMenuItem[];
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
      title: options.zoom.label,
      icon: <FaSearchPlus />,
    },
    {
      id: 'zoomOut',
      title:
        'Horizontal zoom out (Press f), Horizontal and Vertical zoom out, double click (Press ff)',
      onClick: handleFullZoomOut,
      icon: <FaExpand />,
    },
    {
      id: 'peakPicking',
      title: `${options.peakPicking.label} (Press p)`,
      icon: <SvgNmrPeakPicking />,
    },
    {
      id: 'integral',
      title: `${options.integral.label} (Press i)`,
      icon: <SvgNmrIntegrate />,
    },
    {
      id: 'zonePicking',
      title: `${options.zonePicking.label} (Press r)`,
      icon: <FaDiceFour />,
    },
    {
      id: 'slicing',
      title: options.slicing.label,
      icon: <PiKnifeBold />,
    },
    {
      id: 'rangePicking',
      title: `${options.rangePicking.label} (Press r)`,
      icon: <SvgNmrRangePicking />,
    },
    {
      id: 'multipleSpectraAnalysis',
      title: options.multipleSpectraAnalysis.label,
      icon: <SvgNmrMultipleAnalysis />,
      checkOptions: { checkSpectrumType: false },
      condition: ftCounter > 0,
    },
    {
      id: 'apodization',
      title: `${options.apodization.label} (Press a)`,
      icon: <SvgNmrApodization />,
    },
    {
      id: 'zeroFilling',
      title: `${options.zeroFilling.label} (Press z)`,
      icon: <SvgNmrZeroFilling />,
    },
    {
      id: 'phaseCorrection',
      title: `${options.phaseCorrection.label} (Press a)`,
      icon: <SvgNmrPhaseCorrection />,
    },
    {
      id: 'phaseCorrectionTwoDimensions',
      title: `${options.phaseCorrectionTwoDimensions.label} (Press a)`,
      icon: <SvgNmrPhaseCorrection />,
    },
    {
      id: 'baselineCorrection',
      title: `${options.baselineCorrection.label} (Press b)`,
      icon: <SvgNmrBaselineCorrection />,
    },
    {
      id: 'exclusionZones',
      title: `${options.exclusionZones.label} (Press e)`,
      icon: <SvgNmrMultipleAnalysis />,
      checkOptions: { checkSpectrumType: false },
      condition: ftCounter > 0,
    },
    {
      id: 'fft',
      title: `${options.fft.label} (Press t)`,
      onClick: handleOnFFTFilter,
      icon: <SvgNmrFourierTransform />,
    },
    {
      id: 'fftDimension1',
      title: options.fftDimension1.label,
      onClick: handleFFtDimension1Filter,
      icon: <SvgNmrFourierTransform />,
    },
    {
      id: 'fftDimension2',
      title: options.fftDimension2.label,
      onClick: handleFFtDimension2Filter,
      icon: <SvgNmrFourierTransform />,
    },
    {
      id: 'import',
      title: options.import.label,
      icon: <FaFileImport />,
      menuItems: importMenu,
      onClick: importHandler,
    },
    {
      id: 'exportAs',
      title: options.exportAs.label,
      icon: <FaFileExport />,
      menuItems: exportMenu,
      onClick: exportHandler,
    },
    {
      id: 'spectraStackAlignments',
      title: `${options.spectraStackAlignments.label} (Press s)`,
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
      title: isRealSpectrumShown ? 'Display real ' : 'Display imaginary',
      icon: <SvgNmrRealImag />,
      onClick: changeSpectrumViewHandler,
    },
    {
      id: 'spectraCenterAlignments',
      title: `Baseline ${verticalAlign === 'bottom' ? 'center' : 'bottom'} (Press c)`,
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
          const { id, icon, title, checkOptions, condition } = item;
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
                title={title}
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
              title={title}
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
