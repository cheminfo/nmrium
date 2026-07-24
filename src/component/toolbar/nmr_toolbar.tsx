import { isSpectrum2DQuadrants } from '@zakodium/nmrium-core';
import { useCallback, useMemo } from 'react';
import { FaDownload } from 'react-icons/fa';
import type { ToolbarItemProps, TooltipItem } from 'react-science/ui';
import { Toolbar, TooltipHelpContent } from 'react-science/ui';

import { useChartData } from '../context/ChartContext.js';
import { useCore } from '../context/CoreContext.tsx';
import { useDispatch } from '../context/DispatchContext.js';
import { useIsPrimaryKeyActivated } from '../context/KeyModifierContext.tsx';
import { useLoader } from '../context/LoaderContext.js';
import { usePreferences } from '../context/PreferencesContext.js';
import type { ToolbarPopoverMenuItem } from '../elements/ToolbarPopoverItem.js';
import { ToolbarPopoverItem } from '../elements/ToolbarPopoverItem.js';
import { useExportManagerAPI } from '../elements/export/ExportManager.js';
import { useActiveSpectrum } from '../hooks/useActiveSpectrum.js';
import useCheckExperimentalFeature from '../hooks/useCheckExperimentalFeature.js';
import { useCheckToolsVisibility } from '../hooks/useCheckToolsVisibility.js';
import useDatumWithSpectraStatistics from '../hooks/useDatumWithSpectraStatistics.js';
import { useDialogToggle } from '../hooks/useDialogToggle.js';
import { useExport } from '../hooks/useExport.js';
import useSpectrum, { useStableSpectrum } from '../hooks/useSpectrum.js';
import useToolsFunctions from '../hooks/useToolsFunctions.js';
import { useVerticalAlign } from '../hooks/useVerticalAlign.js';
import ExportAsJcampModal from '../modal/ExportAsJcampModal.js';
import { ImportPublicationStringModal } from '../modal/ImportPublicationStringModal.js';
import { LoadJCAMPModal } from '../modal/LoadJCAMPModal.js';
import SaveAsModal from '../modal/SaveAsModal.js';
import { MetaImportationModal } from '../modal/metaImportation/MetaImportationModal.js';
import { CoreOperatorTool } from '../utility/core_slots/core_operator_tool.tsx';

import type { IconOptions, MainTool } from './ToolTypes.js';
import { getToolIcon, options } from './ToolTypes.js';
import type { ExportMenuItems } from './toolbarMenu.js';
import { EXPORT_MENU, IMPORT_MENU } from './toolbarMenu.js';

interface BaseToolItem extends Pick<ToolbarItemProps, 'disabled'> {
  id: MainTool;
  isVisible?: boolean;
  iconProps?: IconOptions;
}
interface ToolItem extends BaseToolItem {
  onClick?: () => void;
  tooltip: string | TooltipItem;
}
interface PopoverToolItem extends BaseToolItem {
  onClick: (data?: any) => void;
  menuItems: ToolbarPopoverMenuItem[];
  tooltip: string | TooltipItem;
}

function isPopoverToolItem(
  item: ToolItem | PopoverToolItem,
): item is PopoverToolItem {
  return !!(item as PopoverToolItem)?.menuItems;
}

function useExportList() {
  const isExperimentalFeature = useCheckExperimentalFeature();
  const spectrum = useActiveSpectrum();
  const exportMenu = isExperimentalFeature
    ? [...EXPORT_MENU]
    : EXPORT_MENU.filter((item) => item.id !== 'nmre');

  if (spectrum) {
    exportMenu.push({
      icon: <FaDownload />,
      text: 'Export as JCAMP-DX',
      data: { id: 'exportAsJcamp' },
    });
  }
  return exportMenu;
}

export default function NMRToolbar() {
  const core = useCore();
  const {
    toolOptions: { selectedTool },
    spectrumLiveProcessed,
  } = useChartData();
  const isButtonVisible = useCheckToolsVisibility();
  const dispatch = useDispatch();
  const spectrum = useSpectrum();
  const stableSpectrum = useStableSpectrum();
  const isPrimaryKeyActivated = useIsPrimaryKeyActivated();

  const {
    isRealSpectrumShown,
    changeSpectrumViewHandler,
    changeDisplayViewModeHandler,
    alignSpectraVerticallyHandler,
    handleChangeOption,
    handleFullZoomOut,
  } = useToolsFunctions();

  const handleChange = useCallback(
    (selectedOption: any) => {
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
    exportAsJcamp: false,
  });

  const verticalAlign = useVerticalAlign();

  const { fidCounter, ftCounter } = useDatumWithSpectraStatistics();

  const importMenu = isExperimentalFeature
    ? [...IMPORT_MENU]
    : IMPORT_MENU.filter((item) => item.id !== 'importPublicationString');

  const exportMenu = useExportList();

  const {
    current: {
      general: { invert },
    },
  } = usePreferences();
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

  const { defaultSaveAsHandler } = useExport();

  const exportViewportAPI = useExportManagerAPI();

  function importHandler(data: any) {
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

  function exportHandler(data: ExportMenuItems[number]['data']) {
    const id = data?.id;

    switch (id) {
      case 'svg':
      case 'png':
        exportViewportAPI.current?.export({ format: id });
        break;
      case 'nmrium_archive':
        defaultSaveAsHandler();
        break;
      case 'advance_save':
        openDialog('saveAs');
        break;
      case 'copy':
        exportViewportAPI.current?.export({
          format: 'png',
          destination: 'clipboard',
        });
        break;
      case 'exportAsJcamp':
        openDialog('exportAsJcamp');
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
        shortcuts: ['Esc'],
        subTitles: [
          { title: 'Vertical', shortcuts: ['Scroll wheel'] },
          { title: 'Horizontal', shortcuts: ['⇧', 'Scroll wheel'] },
          { title: 'Horizontal and Vertical', shortcuts: ['CTRL', 'drag'] },
          { title: 'Pan', shortcuts: ['Right button'] },
        ],
        style: { minWidth: '300px' },
      },
      iconProps: {
        strokeWidth: 3,
      },
    },
    {
      id: 'zoomOut',
      tooltip: {
        title: 'Zoom out',
        subTitles: [
          { title: 'Horizontal', shortcuts: ['f'] },
          { title: 'Horizontal and Vertical', shortcuts: ['f', 'f'] },
        ],
        description: `Zoom out by ${isPrimaryKeyActivated ? 'Shift + ' : ''}double-clicking the left mouse button, and fully zoom out horizontally by pressing the key "f". Alternatively, press the key "ff" to fit the spectra horizontally and vertically.`,
        link: 'https://docs.nmrium.org/help/zoom-and-scale',
      },
      onClick: handleFullZoomOut,
    },
    {
      id: 'peakPicking',
      tooltip: {
        title: options.peakPicking.label,
        shortcuts: ['p'],
        description: 'Detect peaks manually or automatically in the spectrum.',
        link: 'https://docs.nmrium.org/help/peaks',
      },
    },
    {
      id: 'integral',
      tooltip: {
        title: options.integral.label,
        shortcuts: ['i'],
        description: `Manually integrate the spectrum. Click, drag, and release ${!invert ? 'while holding SHIFT' : ''} to draw the integral. Resize the integrals by moving the edges. Cut an integral with ${!invert ? 'SHIFT +' : ''} click.`,
        link: 'https://docs.nmrium.org/help/integrations',
      },
    },
    {
      id: 'zonePicking',
      tooltip: {
        title: options.zonePicking.label,
        shortcuts: ['r'],
        description: `Draw 2D zones by clicking, dragging, and releasing${!invert ? 'while holding SHIFT' : ''}. Alternatively, detect zones automatically.`,
        link: 'https://docs.nmrium.org/30_2d-spectra/zones',
      },
    },
    {
      id: 'slicing',
      tooltip: {
        title: options.slicing.label,
        description:
          'Display the horizontal and vertical slices of the selected 2D spectrum at the level of the pointer.',
        link: 'https://docs.nmrium.org/30_2d-spectra/slicing',
      },
    },
    {
      id: 'rangePicking',
      tooltip: {
        title: options.rangePicking.label,
        shortcuts: ['r'],
        description: `Define ranges and analyse multiplet automatically or manually.  Click, drag, and release ${!invert ? 'while holding SHIFT' : ''} to draw the range. Ranges can be resized by moving the edges.`,
        link: 'https://docs.nmrium.org/help/ranges',
      },
    },
    {
      id: 'multipleSpectraAnalysis',
      tooltip: {
        title: options.multipleSpectraAnalysis.label,
        shortcuts: ['m'],
        description:
          'Integrate multiple spectra at once and adjust integration zones by dragging their edges.',
      },
      isVisible: ftCounter > 0,
    },
    {
      id: 'apodization',
      tooltip: {
        title: options.apodization.label,
        shortcuts: ['a'],
        description:
          'Apply mathematical function that the FID is multiplied by before Fourier Transform.',
        link: 'https://docs.nmrium.org/help/apodization',
      },
    },
    {
      id: 'apodizationDimension1',
      tooltip: {
        title: options.apodizationDimension1.label,
      },
    },
    {
      id: 'apodizationDimension2',
      tooltip: {
        title: options.apodizationDimension2.label,
      },
    },
    {
      id: 'zeroFilling',
      tooltip: {
        title: options.zeroFilling.label,
        shortcuts: ['z'],
        description:
          'Improve spectrum quality by increasing the number of points. By default, the number of points is twice as many as in the original FID.',
        link: 'https://docs.nmrium.org/help/zero-filling',
      },
    },
    {
      id: 'zeroFillingDimension1',
      tooltip: {
        title: options.zeroFilling.label,
        description:
          'Improve spectrum quality by increasing the number of points',
      },
    },
    {
      id: 'zeroFillingDimension2',
      tooltip: {
        title: options.zeroFilling.label,
        description:
          'Improve spectrum quality by increasing the number of points.',
      },
    },
    {
      id: 'phaseCorrection',
      tooltip: {
        title: options.phaseCorrection.label,
        shortcuts: ['a'],
        description: `Correct the spectrum phase manually or automatically. For manual phase correction, define the pivot${!invert ? ' using SHIFT +' : ''} click, then press the PH0 and PH1 button, and move the mouse horizontally.`,
        link: 'https://docs.nmrium.org/help/phase',
      },
    },
    {
      id: 'phaseCorrectionTwoDimensions',
      tooltip: {
        title: options.phaseCorrectionTwoDimensions.label,
        shortcuts: ['a'],
        description: 'To phase the spectrum after the FFT.',
      },
      isVisible: isSpectrum2DQuadrants(spectrum),
    },
    {
      id: 'baselineCorrection',
      tooltip: {
        title: options.baselineCorrection.label,
        shortcuts: ['b'],
        description: `Correct the baseline of the spectrum. You should draw zones corresponding to the noise using click, drag, release${!invert ? 'while holding SHIFT' : ''}.`,
        link: 'https://docs.nmrium.org/help/baseline',
      },
    },
    {
      id: 'exclusionZones',
      tooltip: {
        title: options.exclusionZones.label,
        shortcuts: ['e'],
        description: `Define exclusion zones by clicking, dragging, releasing${!invert ? ' while holding SHIFT' : ''}. This option is practical for excluding large peaks like solvents.`,
      },
      isVisible: ftCounter > 0,
    },
    {
      id: 'fft',
      tooltip: {
        title: options.fft.label,
        shortcuts: ['t'],
        description: 'Perform a Fourier transform on the FID.',
        link: 'https://docs.nmrium.org/help/ft',
      },
      onClick: handleOnFFTFilter,
    },
    {
      id: 'fftDimension1',
      tooltip: options.fftDimension1.label,
      onClick: handleFFtDimension1Filter,
    },
    {
      id: 'fftDimension2',
      tooltip: options.fftDimension2.label,
      onClick: handleFFtDimension2Filter,
    },
    {
      id: 'import',
      tooltip: options.import.label,
      menuItems: importMenu,
      onClick: importHandler,
    },
    {
      id: 'exportAs',
      tooltip: options.exportAs.label,
      menuItems: exportMenu,
      onClick: exportHandler,
    },
    {
      id: 'spectraStackAlignments',
      tooltip: {
        title: options.spectraStackAlignments.label,
        shortcuts: ['s'],
        description:
          'Toggle between stack mode and all the spectra aligned at the bottom.',
      },
      isVisible: ftCounter > 1,
      onClick: changeDisplayViewModeHandler,
    },
    {
      id: 'realImaginary',
      tooltip: {
        title: `Display ${isRealSpectrumShown ? 'real' : 'imaginary'}`,
        description:
          'Toggle between the imaginary and real parts of the spectrum.',
      },
      onClick: changeSpectrumViewHandler,
    },
    {
      id: 'spectraCenterAlignments',
      tooltip: {
        title: `Baseline ${verticalAlign === 'bottom' ? 'center' : 'bottom'}`,
        shortcuts: ['c'],
        description:
          'Toggle between alignment of the spectra in the center or at the bottom of the display.',
      },
      isVisible: ftCounter > 0 || fidCounter > 0,
      onClick: alignSpectraVerticallyHandler,
    },
    {
      id: 'inset',
      tooltip: {
        title: options.inset.label,
        shortcuts: ['n'],
        description:
          'Drag a rectangle over the spectrum region to create an inset.',
      },
    },
  ];

  const pluginTools = useMemo(() => {
    return core.slotOperators();
  }, [core]);
  const isExperimental = useCheckExperimentalFeature();

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
      {dialog.exportAsJcamp && (
        <ExportAsJcampModal exportActiveSpectrum closeDialog={closeDialog} />
      )}
      <SaveAsModal isOpen={dialog.saveAs} onCloseDialog={closeDialog} />
      <Toolbar vertical>
        {toolItems.map((item) => {
          const { id, tooltip, disabled, isVisible, iconProps } = item;
          const Icon = getToolIcon(id, { verticalAlign, isRealSpectrumShown });
          const isToolVisible =
            isButtonVisible(id) && (isVisible === undefined || isVisible);

          if (!isToolVisible) return null;

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
                    <TooltipHelpContent {...tooltip} />
                  )
                }
                tooltipProps={{
                  minimal: true,
                }}
                id={id}
                active={selectedTool === id}
                icon={Icon && <Icon {...iconProps} />}
                onClick={onClick}
                disabled={disabled}
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
                  <TooltipHelpContent {...tooltip} />
                )
              }
              tooltipProps={{
                minimal: true,
              }}
              id={id}
              active={selectedTool === id}
              icon={Icon && <Icon {...iconProps} />}
              disabled={disabled}
            />
          );
        })}

        {isExperimental &&
          pluginTools.map((operatorUI) => (
            <CoreOperatorTool
              key={operatorUI.id}
              operator={operatorUI}
              spectrum={stableSpectrum}
              liveSpectrum={spectrumLiveProcessed}
              onAddOperation={(operation) => {
                console.log('onAddOperation', operation);
              }}
            />
          ))}
      </Toolbar>
    </>
  );
}
