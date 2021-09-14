/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Toolbar } from 'analysis-ui-components';
import {
  SvgNmrRealImag,
  SvgNmrOverlay3,
  SvgNmrOverlay3Aligned,
  SvgNmrAlignBottom,
  SvgNmrAlignCenter,
} from 'cheminfo-font';
import lodashGet from 'lodash/get';
import { Fragment, useCallback, memo, useMemo } from 'react';
import {
  FaDownload,
  FaFileDownload,
  FaFileImage,
  FaCopy,
  FaFileExport,
  FaFile,
  FaFileImport,
} from 'react-icons/fa';

import { Info as InfoDatum1D } from '../../data/data1d/Spectrum1D';
import { Info as InfoDatum2D } from '../../data/data2d/Spectrum2D';
import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import { useLoader } from '../context/LoaderContext';
import { usePreferences } from '../context/PreferencesContext';
import MenuButton from '../elements/MenuButton';
import { useAlert } from '../elements/popup/Alert';
import { useModal } from '../elements/popup/Modal';
import useCheckExperimentalFeature from '../hooks/useCheckExperimentalFeature';
import useDatumWithSpectraStatistics from '../hooks/useDatumWithSpectraStatistics';
import useExport from '../hooks/useExport';
import useToolsFunctions from '../hooks/useToolsFunctions';
import ImportPublicationStringModal from '../modal/ImportPublicationStringModal';
import LoadJCAMPModal from '../modal/LoadJCAMPModal';
import { ActiveSpectrum } from '../reducer/Reducer';
import { DISPLAYER_MODE } from '../reducer/core/Constants';
import { LOAD_JCAMP_FILE, SET_LOADING_FLAG } from '../reducer/types/Types';

const styles = css`
  background-color: transparent;
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
      font-size: 24px;
    }
  }
`;

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
  displayerMode: DISPLAYER_MODE;
  info: InfoDatum1D | InfoDatum2D;
  verticalAlign: {
    flag: boolean;
    stacked: boolean;
  };
}

function BasicToolBarInner({
  info,
  verticalAlign,
  displayerMode,
  ftCounter,
  fidCounter,
  activeSpectrum,
}: BasicToolBarInnerProps) {
  const dispatch = useDispatch();
  const preferences = usePreferences();
  const alert = useAlert();
  const modal = useModal();
  const openLoader = useLoader();

  const isExperimentalFeature = useCheckExperimentalFeature();

  const importMenu = useMemo(() => {
    return isExperimentalFeature
      ? IMPORT_MENU.filter((item) => item.id !== 'importPublicationString')
      : IMPORT_MENU;
  }, [isExperimentalFeature]);

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
    saveAsNMREHandler,
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

  const isButtonVisible = useCallback(
    (key) => {
      return !lodashGet(preferences, `display.toolBarButtons.${key}`);
    },
    [preferences],
  );

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
          return;
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
          void saveAsJSONHandler();
          break;
        case 'advance_save':
          void saveAsHandler();
          break;
        case 'nmre':
          void saveAsNMREHandler();
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
      saveAsNMREHandler,
      saveToClipboardHandler,
    ],
  );

  return (
    <Fragment>
      {isButtonVisible('hideImport') && (
        <MenuButton
          style={styles}
          className="fa"
          component={<FaFileImport />}
          toolTip="Import"
          onClick={(element) => {
            importHandler(element);
            return null;
          }}
          items={importMenu}
        />
      )}
      {isButtonVisible('hideExportAs') && (
        <MenuButton
          style={styles}
          className="fa"
          component={<FaFileExport />}
          toolTip="Export As"
          onClick={(element) => {
            exportHandler(element);
            return null;
          }}
          items={EXPORT_MENU}
        />
      )}

      {displayerMode === DISPLAYER_MODE.DM_1D &&
        isButtonVisible('hideSpectraStackAlignments') &&
        ftCounter > 1 &&
        (info?.isFt || !activeSpectrum) && (
          <Toolbar.Item
            id="spectra-alignment"
            className="cheminfo"
            title="Spectra alignment ( Press s )"
            onClick={changeDisplayViewModeHandler}
          >
            {verticalAlign.stacked ? (
              <SvgNmrOverlay3Aligned />
            ) : (
              <SvgNmrOverlay3 />
            )}
          </Toolbar.Item>
        )}
      {displayerMode === DISPLAYER_MODE.DM_1D &&
        isButtonVisible('hideRealImaginary') &&
        info.isComplex && (
          <Toolbar.Item
            id="display"
            title={isRealSpectrumShown ? 'Display Real ' : 'Display Imaginary'}
            onClick={changeSpectrumViewHandler}
            className="cheminfo"
          >
            <SvgNmrRealImag />
          </Toolbar.Item>
        )}
      {displayerMode === DISPLAYER_MODE.DM_1D &&
        isButtonVisible('hideSpectraCenterAlignments') &&
        (ftCounter > 0 || fidCounter > 0) && (
          <Toolbar.Item
            id="baseline-position"
            title={
              !verticalAlign.flag
                ? 'Baseline  Center ( Press c )'
                : 'Baseline  Bottom ( Press c )'
            }
            onClick={alignSpectrumsVerticallyHandler}
            className="cheminfo"
          >
            <div style={{ fontSize: 24 }}>
              {!verticalAlign.flag ? (
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
  const { activeSpectrum, verticalAlign, displayerMode, activeTab } =
    useChartData();

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
