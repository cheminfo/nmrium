import {
  SvgNmrRealImag,
  SvgNmrOverlay3,
  SvgNmrOverlay3Aligned,
  SvgNmrAlignBottom,
  SvgNmrAlignCenter,
} from 'cheminfo-font';
import { Fragment, useCallback, memo } from 'react';
import {
  FaDownload,
  FaFileDownload,
  FaFileImage,
  FaCopy,
  FaFileExport,
  FaFile,
  FaFileImport,
} from 'react-icons/fa';
import { Toolbar, useOnOff } from 'react-science/ui';

import { useChartData } from '../context/ChartContext';
import { useLoader } from '../context/LoaderContext';
import { DropdownMenu, DropdownMenuProps } from '../elements/DropdownMenu';
import { useModal } from '../elements/popup/Modal';
import useCheckExperimentalFeature from '../hooks/useCheckExperimentalFeature';
import { useCheckToolsVisibility } from '../hooks/useCheckToolsVisibility';
import useDatumWithSpectraStatistics from '../hooks/useDatumWithSpectraStatistics';
import useExport from '../hooks/useExport';
import useToolsFunctions from '../hooks/useToolsFunctions';
import { useVerticalAlign } from '../hooks/useVerticalAlign';
import ImportPublicationStringModal from '../modal/ImportPublicationStringModal';
import { LoadJCAMPModal } from '../modal/LoadJCAMPModal';
import { useMetaInformationImportationModal } from '../modal/metaImportation';
import { VerticalAlignment } from '../reducer/Reducer';

import { options } from './ToolTypes';

const IMPORT_MENU: DropdownMenuProps['options'] = [
  {
    icon: <FaFile />,
    text: 'Import from file system (Press Ctrl + O)',
    data: {
      id: 'importFile',
    },
  },
  {
    icon: <FaFile />,
    text: 'Add JCAMP-DX from URL',
    data: {
      id: 'importJDX',
    },
  },
  {
    icon: <FaFile />,
    text: 'Import from publication string',
    data: {
      id: 'importPublicationString',
    },
  },
  {
    icon: <FaFile />,
    text: 'Import meta information',
    data: {
      id: 'importMetaInformation',
    },
  },
];

const EXPORT_MENU: DropdownMenuProps['options'] = [
  {
    icon: <FaDownload />,
    text: 'Export as SVG',
    data: {
      id: 'svg',
    },
  },
  {
    icon: <FaFileImage />,
    text: 'Export as PNG',
    data: {
      id: 'png',
    },
  },
  {
    icon: <FaFileDownload />,
    text: 'Save data ( Press Ctrl + S )',
    data: {
      id: 'json',
    },
  },
  {
    icon: <FaFileDownload />,
    text: 'Save data as  ( Press Ctrl + Shift + S )',
    data: {
      id: 'advance_save',
    },
  },
  {
    icon: <FaFileDownload />,
    text: 'Save NMRE data',
    data: {
      id: 'nmre',
    },
  },
  {
    icon: <FaCopy />,
    text: 'Copy image to Clipboard ( Press Ctrl + C )',
    data: {
      id: 'copy',
    },
  },
];

interface BasicToolBarInnerProps {
  fidCounter: number;
  ftCounter: number;
  verticalAlign: VerticalAlignment;
}

function BasicToolBarInner({
  verticalAlign,
  ftCounter,
  fidCounter,
}: BasicToolBarInnerProps) {
  const modal = useModal();
  const openLoader = useLoader();
  const openMetaInformationModal = useMetaInformationImportationModal();

  const isExperimentalFeature = useCheckExperimentalFeature();
  const isButtonVisible = useCheckToolsVisibility();
  const [isLoadModalOpened, openLoadModal, closeLoadModal] = useOnOff(false);

  const importMenu = isExperimentalFeature
    ? IMPORT_MENU
    : IMPORT_MENU.filter((item) => item.id !== 'importPublicationString');

  const exportMenu = isExperimentalFeature
    ? EXPORT_MENU
    : EXPORT_MENU.filter((item) => item.id !== 'nmre');

  const {
    isRealSpectrumShown,
    changeSpectrumViewHandler,
    changeDisplayViewModeHandler,
    alignSpectrumsVerticallyHandler,
  } = useToolsFunctions();

  const {
    saveAsSVGHandler,
    saveAsPNGHandler,
    saveAsJSONHandler,
    saveToClipboardHandler,
    saveAsHandler,
  } = useExport();

  const importJCAMPFile = useCallback(() => {
    openLoadModal();
  }, [openLoadModal]);

  const openImportPublicationStringModal = useCallback(() => {
    modal.show(
      <ImportPublicationStringModal onClose={() => modal.close()} />,
      {},
    );
  }, [modal]);

  const importHandler = useCallback(
    (data) => {
      switch (data?.id) {
        case 'importFile':
          openLoader();
          break;
        case 'importJDX':
          importJCAMPFile();
          break;
        case 'importPublicationString':
          openImportPublicationStringModal();
          break;
        case 'importMetaInformation':
          openMetaInformationModal();
          break;
        default:
      }
    },
    [
      openLoader,
      importJCAMPFile,
      openImportPublicationStringModal,
      openMetaInformationModal,
    ],
  );

  const exportHandler = useCallback(
    (data) => {
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
          void saveAsHandler();
          break;
        case 'copy':
          void saveToClipboardHandler();
          break;

        default:
          break;
      }
    },
    [
      saveAsSVGHandler,
      saveAsPNGHandler,
      saveAsJSONHandler,
      saveAsHandler,
      saveToClipboardHandler,
    ],
  );

  return (
    <Fragment>
      <LoadJCAMPModal
        isOpen={isLoadModalOpened}
        onCloseDialog={closeLoadModal}
      />

      {isButtonVisible('import') && (
        <DropdownMenu
          placement="right-start"
          onSelect={(data) => {
            importHandler(data);
          }}
          targetTagName="div"
          targetProps={{ style: { flex: 'none' } }}
          options={importMenu}
        >
          <Toolbar.Item
            id={options.import.id}
            title={options.import.label}
            icon={<FaFileImport />}
          />
        </DropdownMenu>
      )}
      {isButtonVisible('exportAs') && (
        <DropdownMenu
          onSelect={(data) => {
            exportHandler(data);
          }}
          placement="right-start"
          targetTagName="div"
          targetProps={{ style: { flex: 'none' } }}
          options={exportMenu}
        >
          <Toolbar.Item
            id={options.exportAs.id}
            title={options.exportAs.label}
            icon={<FaFileExport />}
          />
        </DropdownMenu>
      )}

      {isButtonVisible('spectraStackAlignments') && ftCounter > 1 && (
        <Toolbar.Item
          id="spectra-alignment"
          className="cheminfo"
          title="Spectra alignment ( Press s )"
          onClick={changeDisplayViewModeHandler}
          icon={
            verticalAlign === 'stack' ? (
              <SvgNmrOverlay3Aligned />
            ) : (
              <SvgNmrOverlay3 />
            )
          }
        />
      )}
      {isButtonVisible('realImaginary') && (
        <Toolbar.Item
          id="display"
          title={isRealSpectrumShown ? 'Display real ' : 'Display imaginary'}
          onClick={changeSpectrumViewHandler}
          className="cheminfo"
          icon={<SvgNmrRealImag />}
        />
      )}
      {isButtonVisible('spectraCenterAlignments') &&
        (ftCounter > 0 || fidCounter > 0) && (
          <Toolbar.Item
            id="baseline-position"
            title={
              verticalAlign === 'bottom'
                ? 'Baseline  center ( Press c )'
                : 'Baseline  bottom ( Press c )'
            }
            onClick={alignSpectrumsVerticallyHandler}
            className="cheminfo"
            icon={
              <>
                {verticalAlign === 'bottom' ? (
                  <SvgNmrAlignCenter />
                ) : (
                  <SvgNmrAlignBottom />
                )}
              </>
            }
          />
        )}
    </Fragment>
  );
}

const MemoizedBasicToolBar = memo(BasicToolBarInner);

export default function BasicToolBar() {
  const {
    displayerMode,
    view: {
      spectra: { activeTab },
    },
  } = useChartData();

  const verticalAlign = useVerticalAlign();

  const { fidCounter, ftCounter } = useDatumWithSpectraStatistics();
  return (
    <MemoizedBasicToolBar
      {...{
        fidCounter,
        ftCounter,
        verticalAlign,
        displayerMode,
        activeTab,
      }}
    />
  );
}
