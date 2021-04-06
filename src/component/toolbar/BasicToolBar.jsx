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
import { usePreferences } from '../context/PreferencesContext';
import MenuButton from '../elements/MenuButton';
import ToolTip from '../elements/ToolTip/ToolTip';
import { useAlert } from '../elements/popup/Alert';
import { useModal } from '../elements/popup/Modal';
import ToolBarWrapper from '../hoc/ToolBarWrapper';
import LoadJCAMPModal from '../modal/LoadJCAMPModal';
import { DISPLAYER_MODE } from '../reducer/core/Constants';
import { LOAD_JCAMP_FILE, SET_LOADING_FLAG } from '../reducer/types/Types';

import useToolsFunctions from './useToolsFunctions';

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

const menuButton = css`
  background-color: transparent;
  border: none;
  border-bottom: 0.55px solid whitesmoke;
  height: 35px;
  outline: outline;
  display: table-cell;
  vertical-align: middle;
  text-align: left;
  padding: 0 10px;

  svg {
    display: inline-block;
  }

  :focus {
    outline: none !important;
  }
  span {
    font-size: 10px;
    padding: 0px 10px;
  }
`;

function BasicToolBar({ info, verticalAlign, displayerMode }) {
  const dispatch = useDispatch();
  const preferences = usePreferences();
  const alert = useAlert();
  const modal = useModal();
  const {
    isStacked,
    isRealSpectrumShown,
    saveAsSVGHandler,
    saveAsPNGHandler,
    saveAsJSONHandler,
    saveAsNMREHandler,
    saveToClipboardHandler,
    changeSpectrumViewHandler,
    handleChangeDisplayViewMode,
    alignSpectrumsVerticallyHandler,
  } = useToolsFunctions(dispatch, alert);

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

  return (
    <Fragment>
      {isButtonVisible('hideImport') && (
        <MenuButton
          style={styles}
          className="fa"
          component={<FaFileImport />}
          toolTip="Import"
        >
          <button type="button" css={menuButton} onClick={importJCAMPFile}>
            <FaFile />
            <span>Add JCAMP-DX from URL</span>
          </button>
        </MenuButton>
      )}
      {isButtonVisible('hideExportAs') && (
        <MenuButton
          style={styles}
          className="fa"
          component={<FaFileExport />}
          toolTip="Export As"
        >
          <button type="button" css={menuButton} onClick={saveAsSVGHandler}>
            <FaDownload />
            <span>Export as SVG</span>
          </button>
          <button type="button" css={menuButton} onClick={saveAsPNGHandler}>
            <FaFileImage />
            <span>Export as PNG</span>
          </button>
          <button type="button" css={menuButton} onClick={saveAsJSONHandler}>
            <FaFileDownload />
            <span>Save data ( Press Ctrl + S )</span>
          </button>
          <button type="button" css={menuButton} onClick={saveAsNMREHandler}>
            <FaFileDownload />
            <span>Save NMRE data </span>
          </button>
          <button
            type="button"
            css={menuButton}
            onClick={saveToClipboardHandler}
          >
            <FaCopy />
            <span>Copy image to Clipboard ( Press Ctrl + C )</span>
          </button>
        </MenuButton>
      )}

      {displayerMode === DISPLAYER_MODE.DM_1D &&
        isButtonVisible('hideSpectraStackAlignments') && (
          <button
            type="button"
            css={styles}
            className="cheminfo"
            onClick={handleChangeDisplayViewMode}
          >
            <ToolTip title="Spectra alignment" popupPlacement="right">
              {!isStacked ? <SvgNmrOverlay3Aligned /> : <SvgNmrOverlay3 />}
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
                !verticalAlign.flag ? 'Baseline  Center' : 'Baseline  Bottom'
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
