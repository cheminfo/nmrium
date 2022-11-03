import { Toolbar } from 'analysis-ui-components';
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

import { Info1D } from '../../data/types/data1d';
import { Info2D } from '../../data/types/data2d';
import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import { useLoader } from '../context/LoaderContext';
import ToolbarMenu from '../elements/ToolbarMenu';
import { useAlert } from '../elements/popup/Alert';
import { useModal } from '../elements/popup/Modal';
import useCheckExperimentalFeature from '../hooks/useCheckExperimentalFeature';
import { useCheckToolsVisibility } from '../hooks/useCheckToolsVisibility';
import useDatumWithSpectraStatistics from '../hooks/useDatumWithSpectraStatistics';
import useExport from '../hooks/useExport';
import useToolsFunctions from '../hooks/useToolsFunctions';
import ImportPublicationStringModal from '../modal/ImportPublicationStringModal';
import LoadJCAMPModal from '../modal/LoadJCAMPModal';
import {
  ActiveSpectrum,
  useActiveSpectrum,
  VerticalAlignment,
} from '../reducer/Reducer';
import { LOAD_JCAMP_FILE, SET_LOADING_FLAG } from '../reducer/types/Types';

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
  activeSpectrum: ActiveSpectrum | null;
  fidCounter: number;
  ftCounter: number;
  info: Info1D | Info2D;
  verticalAlign: {
    align: VerticalAlignment;
  };
}

function BasicToolBarInner({
  info,
  verticalAlign,
  ftCounter,
  fidCounter,
  activeSpectrum,
}: BasicToolBarInnerProps) {
  const dispatch = useDispatch();
  const alert = useAlert();
  const modal = useModal();
  const openLoader = useLoader();

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

  const LoadJacmpHandler = useCallback(
    (file) => {
      if (file) {
        dispatch({ type: LOAD_JCAMP_FILE, files: [file] });
        modal.close();
      } else {
        alert.error('you file must be one of those extensions [ .jdx, dx ] ');
      }
    },
    [alert, dispatch, modal],
  );

  const startLoadingHandler = useCallback(() => {
    modal.close();
    dispatch({ type: SET_LOADING_FLAG, isLoading: true });
  }, [dispatch, modal]);

  const importJCAMPFile = useCallback(() => {
    modal.show(
      <LoadJCAMPModal
        onLoadClick={LoadJacmpHandler}
        onClose={() => modal.close()}
        startLoading={startLoadingHandler}
      />,
      {},
    );
  }, [LoadJacmpHandler, modal, startLoadingHandler]);

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
        default:
      }
    },
    [openLoader, importJCAMPFile, openImportPublicationStringModal],
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

      {isButtonVisible('spectraStackAlignments') &&
        ftCounter > 1 &&
        (info?.isFt || !activeSpectrum) && (
          <Toolbar.Item
            id="spectra-alignment"
            className="cheminfo"
            title="Spectra alignment ( Press s )"
            onClick={changeDisplayViewModeHandler}
          >
            {verticalAlign.align === 'stack' ? (
              <SvgNmrOverlay3Aligned />
            ) : (
              <SvgNmrOverlay3 />
            )}
          </Toolbar.Item>
        )}
      {isButtonVisible('realImaginary') && info.isComplex && (
        <Toolbar.Item
          id="display"
          title={isRealSpectrumShown ? 'Display Real ' : 'Display Imaginary'}
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
              verticalAlign.align === 'bottom'
                ? 'Baseline  Center ( Press c )'
                : 'Baseline  Bottom ( Press c )'
            }
            onClick={alignSpectrumsVerticallyHandler}
            className="cheminfo"
          >
            <div style={{ fontSize: 24 }}>
              {verticalAlign.align === 'bottom' ? (
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
    verticalAlign,
    displayerMode,
    view: {
      spectra: { activeTab },
    },
  } = useChartData();

  const activeSpectrum = useActiveSpectrum();
  const { info, fidCounter, ftCounter } = useDatumWithSpectraStatistics();
  return (
    <MemoizedBasicToolBar
      {...{
        info,
        fidCounter,
        ftCounter,
        activeSpectrum,
        verticalAlign,
        displayerMode,
        activeTab,
      }}
    />
  );
}
