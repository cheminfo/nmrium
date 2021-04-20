/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import {
  SvgNmrRealImag,
  SvgNmrOverlay3,
  SvgNmrOverlay3Aligned,
  SvgNmrAlignBottom,
  SvgNmrAlignCenter,
} from 'cheminfo-font';
import lodashGet from 'lodash/get';
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

import { useDispatch } from '../context/DispatchContext';
import { useLoader } from '../context/LoaderContext';
import { usePreferences } from '../context/PreferencesContext';
import MenuButton from '../elements/MenuButton';
import ToolTip from '../elements/ToolTip/ToolTip';
import { useAlert } from '../elements/popup/Alert';
import { useModal } from '../elements/popup/Modal';
import ToolBarWrapper from '../hoc/ToolBarWrapper';
import useExport from '../hooks/useExport';
import useToolsFunctions from '../hooks/useToolsFunctions';
import LoadJCAMPModal from '../modal/LoadJCAMPModal';
import { DISPLAYER_MODE } from '../reducer/core/Constants';
import { LOAD_JCAMP_FILE, SET_LOADING_FLAG } from '../reducer/types/Types';

const styles = css`
  background-color: transparent;
  border: none;
  width: 35px;
  height: 35px;
  min-height: 35px;
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

function BasicToolBar({ info, verticalAlign, displayerMode }) {
  const dispatch = useDispatch();
  const preferences = usePreferences();
  const alert = useAlert();
  const modal = useModal();
  const loader = useLoader();

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
  } = useExport();

  const selectedSpectrumInfo = { isComplex: false, isFid: false, ...info };

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

  const isButtonVisible = useCallback(
    (key) => {
      return !lodashGet(preferences, `display.toolBarButtons.${key}`);
    },
    [preferences],
  );
  const importFromFileSystemHandler = useCallback(() => {
    loader.open();
  }, [loader]);

  const ImportHandler = useCallback(
    ({ id }) => {
      switch (id) {
        case 'importFile':
          importFromFileSystemHandler();
          break;
        case 'importJDX':
          importJCAMPFile();
          break;
        default:
          return;
      }
    },
    [importFromFileSystemHandler, importJCAMPFile],
  );

  const exportHandler = useCallback(
    ({ id }) => {
      switch (id) {
        case 'svg':
          saveAsSVGHandler();
          break;
        case 'png':
          saveAsPNGHandler();
          break;
        case 'json':
          saveAsJSONHandler();
          break;
        case 'nmre':
          saveAsNMREHandler();
          break;
        case 'copy':
          saveToClipboardHandler();
          break;

        default:
          break;
      }
    },
    [
      saveAsSVGHandler,
      saveAsPNGHandler,
      saveAsJSONHandler,
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
          onClick={ImportHandler}
          items={IMPORT_MENU}
        />
      )}
      {isButtonVisible('hideExportAs') && (
        <MenuButton
          style={styles}
          className="fa"
          component={<FaFileExport />}
          toolTip="Export As"
          onClick={exportHandler}
          items={EXPORT_MENU}
        />
      )}

      {displayerMode === DISPLAYER_MODE.DM_1D &&
        isButtonVisible('hideSpectraStackAlignments') && (
          <button
            type="button"
            css={styles}
            className="cheminfo"
            onClick={changeDisplayViewModeHandler}
          >
            <ToolTip
              title="Spectra alignment ( Press s )"
              popupPlacement="right"
            >
              {verticalAlign.stacked ? (
                <SvgNmrOverlay3Aligned />
              ) : (
                <SvgNmrOverlay3 />
              )}
            </ToolTip>
          </button>
        )}
      {displayerMode === DISPLAYER_MODE.DM_1D &&
        isButtonVisible('hideRealImaginary') &&
        selectedSpectrumInfo &&
        selectedSpectrumInfo.isComplex && (
          <button
            css={styles}
            className="cheminfo"
            type="button"
            onClick={changeSpectrumViewHandler}
          >
            <ToolTip
              title={
                isRealSpectrumShown ? 'Display Real ' : 'Display Imaginary '
              }
              popupPlacement="right"
            >
              <SvgNmrRealImag />
            </ToolTip>
          </button>
        )}
      {displayerMode === DISPLAYER_MODE.DM_1D &&
        isButtonVisible('hideSpectraCenterAlignments') && (
          <button
            css={styles}
            className="cheminfo"
            type="button"
            onClick={alignSpectrumsVerticallyHandler}
          >
            <ToolTip
              title={
                !verticalAlign.flag
                  ? 'Baseline  Center ( Press c )'
                  : 'Baseline  Bottom ( Press c )'
              }
              popupPlacement="right"
            >
              {!verticalAlign.flag ? (
                <SvgNmrAlignCenter />
              ) : (
                <SvgNmrAlignBottom />
              )}
            </ToolTip>
          </button>
        )}
    </Fragment>
  );
}

export default ToolBarWrapper(memo(BasicToolBar));
