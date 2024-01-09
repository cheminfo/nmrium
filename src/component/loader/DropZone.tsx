/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { fileCollectionFromFileList } from 'filelist-utils';
import { read as readDropFiles } from 'nmr-load-save';
import { ParseResult } from 'papaparse';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaUpload } from 'react-icons/fa';

import { isMetaFile, parseMetaFile } from '../../data/parseMeta';
import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import { LoaderProvider } from '../context/LoaderContext';
import { useLogger } from '../context/LoggerContext';
import { usePreferences } from '../context/PreferencesContext';
import { useAlert } from '../elements/popup/Alert';
import useCheckExperimentalFeature from '../hooks/useCheckExperimentalFeature';
import { useCheckToolsVisibility } from '../hooks/useCheckToolsVisibility';
import { useMetaInformationImportationModal } from '../modal/metaImportation/index';

const style = css`
  height: 100%;
  background-color: #b5b5b599;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-flow: column;
  z-index: 99999;

  p {
    color: white;
    background-color: rgb(104 104 104);
    padding: 1.5%;
    border-radius: 30px;
    margin: 0;
  }

  svg {
    stroke-width: 0;
    font-size: 3rem !important;
    fill: white;
  }
`;

const containerStyle = css`
  border: 0.55px #e6e6e6 solid;
  display: flex;
  flex: 1;
  flex-direction: 'column';
  height: 100%;
`;

function DropZone(props) {
  const { width, height } = useChartData();
  const dispatch = useDispatch();
  const { dispatch: dispatchPreferences, current: workspacePreferences } =
    usePreferences();
  const preferences = usePreferences();
  const isToolEnabled = useCheckToolsVisibility();
  const openImportMetaInformationModal = useMetaInformationImportationModal();
  const alert = useAlert();
  const { logger } = useLogger();
  const experimentalFeatures = useCheckExperimentalFeature();

  async function loadFilesHandler(files) {
    try {
      if (files.length === 1 && isMetaFile(files[0])) {
        openImportMetaInformationModal(files[0]);
      } else {
        const fileCollection = await fileCollectionFromFileList(files);
        const metaFile = Object.values(fileCollection.files).find((file) =>
          isMetaFile(file),
        );
        let parseMetaFileResult: ParseResult<any> | null = null;
        if (metaFile) {
          parseMetaFileResult = await parseMetaFile(metaFile);
        }
        const { nmrLoaders: sourceSelector } = preferences.current;
        const { onLoadProcessing, spectraColors } = workspacePreferences;
        const { nmriumState, containsNmrium } = await readDropFiles(
          fileCollection,
          {
            sourceSelector,
            logger: logger.child({ context: 'nmr-processing' }),
            onLoadProcessing,
            experimentalFeatures,
          },
        );

        if ((nmriumState as any)?.settings) {
          dispatchPreferences({
            type: 'SET_WORKSPACE',
            payload: {
              data: (nmriumState as any).settings,
              workspaceSource: 'nmriumFile',
            },
          });
        }
        dispatch({
          type: 'LOAD_DROP_FILES',
          payload: {
            nmriumState,
            containsNmrium,
            parseMetaFileResult,
            spectraColors,
          },
        });
      }
    } catch (error: any) {
      alert.error(error.message);
      logger.error(error);
    } finally {
      dispatch({ type: 'SET_LOADING_FLAG', payload: { isLoading: false } });
    }
  }

  function onDrop(droppedFiles) {
    dispatch({ type: 'SET_LOADING_FLAG', payload: { isLoading: true } });
    void loadFilesHandler(droppedFiles);
  }

  const isImportEnabled = isToolEnabled('import');

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    open: openImportDialog,
  } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    noDrag: !isImportEnabled,
  });

  const open = useCallback(() => {
    if (isImportEnabled) {
      openImportDialog();
    }
  }, [isImportEnabled, openImportDialog]);

  return (
    <LoaderProvider value={open}>
      <div {...getRootProps()} role="none" css={containerStyle}>
        <input {...getInputProps()} />
        {isDragActive && (
          <div
            css={style}
            style={{
              width: `${width}px`,
              height: `${height}px`,
              marginTop: '30px',
              marginLeft: '30px',
            }}
          >
            <FaUpload />
            <p>Drop your files here</p>
          </div>
        )}
        {props.children}
      </div>
    </LoaderProvider>
  );
}

export default DropZone;
