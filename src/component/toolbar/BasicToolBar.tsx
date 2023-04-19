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
import { Toolbar } from 'react-science/ui';

import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import { useLoader } from '../context/LoaderContext';
import ToolbarMenu from '../elements/ToolbarMenu';
import { useModal } from '../elements/popup/Modal';
import useCheckExperimentalFeature from '../hooks/useCheckExperimentalFeature';
import { useCheckToolsVisibility } from '../hooks/useCheckToolsVisibility';
import useDatumWithSpectraStatistics from '../hooks/useDatumWithSpectraStatistics';
import useExport from '../hooks/useExport';
import useToolsFunctions from '../hooks/useToolsFunctions';
import { useVerticalAlign } from '../hooks/useVerticalAlign';
import ImportPublicationStringModal from '../modal/ImportPublicationStringModal';
import LoadJCAMPModal from '../modal/LoadJCAMPModal';
import { useMetaInformationImportationModal } from '../modal/metaImportation/index';
import { VerticalAlignment } from '../reducer/Reducer';
import { SET_LOADING_FLAG } from '../reducer/types/Types';

const IMPORT_MENU = [
  {
    id: 'importFile',
    icon: <FaFile />,
    label: 'Import from file system (Press Ctrl + O)',
  },
  {
    id: 'importJDX',
    icon: <FaFile />,
    label: 'Add JCAMP-DX from URL',
  },
  {
    id: 'importPublicationString',
    icon: <FaFile />,
    label: 'Import from publication string',
  },
  {
    id: 'importMetaInformation',
    icon: <FaFile />,
    label: 'Import meta information',
  },
];

const EXPORT_MENU = [
  {
    id: 'svg',
    icon: <FaDownload />,
    label: 'Export as SVG',
  },
  {
    id: 'png',
    icon: <FaFileImage />,
    label: 'Export as PNG',
  },
  {
    id: 'json',
    icon: <FaFileDownload />,
    label: 'Save data ( Press Ctrl + S )',
  },
  {
    id: 'advance_save',
    icon: <FaFileDownload />,
    label: 'Save data as  ( Press Ctrl + Shift + S )',
  },
  {
    id: 'nmre',
    icon: <FaFileDownload />,
    label: 'Save NMRE data',
  },
  {
    id: 'copy',
    icon: <FaCopy />,
    label: 'Copy image to Clipboard ( Press Ctrl + C )',
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
  const dispatch = useDispatch();
  const modal = useModal();
  const openLoader = useLoader();
  const openMetaInformationModal = useMetaInformationImportationModal();

  const isExperimentalFeature = useCheckExperimentalFeature();
  const isButtonVisible = useCheckToolsVisibility();

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

  const startLoadingHandler = useCallback(() => {
    modal.close();
    dispatch({ type: SET_LOADING_FLAG, isLoading: true });
  }, [dispatch, modal]);

  const importJCAMPFile = useCallback(() => {
    modal.show(
      <LoadJCAMPModal
        onClose={() => modal.close()}
        startLoading={startLoadingHandler}
      />,
      {},
    );
  }, [modal, startLoadingHandler]);

  const openImportPublicationStringModal = useCallback(() => {
    modal.show(
      <ImportPublicationStringModal onClose={() => modal.close()} />,
      {},
    );
  }, [modal]);

  const importHandler = useCallback(
    ({ id }) => {
      switch (id) {
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
    ({ id }) => {
      switch (id) {
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
      {isButtonVisible('import') && (
        <ToolbarMenu
          component={<FaFileImport />}
          toolTip="Import"
          onClick={(element) => {
            importHandler(element);
            return null;
          }}
          items={importMenu}
        />
      )}
      {isButtonVisible('exportAs') && (
        <ToolbarMenu
          component={<FaFileExport />}
          toolTip="Export As"
          onClick={(element) => {
            exportHandler(element);
            return null;
          }}
          items={exportMenu}
        />
      )}

      {isButtonVisible('spectraStackAlignments') && ftCounter > 1 && (
        <Toolbar.Item
          id="spectra-alignment"
          className="cheminfo"
          title="Spectra alignment ( Press s )"
          onClick={changeDisplayViewModeHandler}
        >
          {verticalAlign === 'stack' ? (
            <SvgNmrOverlay3Aligned />
          ) : (
            <SvgNmrOverlay3 />
          )}
        </Toolbar.Item>
      )}
      {isButtonVisible('realImaginary') && (
        <Toolbar.Item
          id="display"
          title={isRealSpectrumShown ? 'Display real ' : 'Display imaginary'}
          onClick={changeSpectrumViewHandler}
          className="cheminfo"
        >
          <SvgNmrRealImag />
        </Toolbar.Item>
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
          >
            <div style={{ fontSize: 24 }}>
              {verticalAlign === 'bottom' ? (
                <SvgNmrAlignCenter />
              ) : (
                <SvgNmrAlignBottom />
              )}
            </div>
          </Toolbar.Item>
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
