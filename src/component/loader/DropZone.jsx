/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaUpload } from 'react-icons/fa';

import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import { LoaderProvider } from '../context/LoaderContext';
import { SET_LOADING_FLAG, LOAD_DROP_FILES } from '../reducer/types/Types';
import { loadFiles } from '../utility/FileUtility';

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
    background-color: rgb(104, 104, 104);
    padding: 1.5%;
    border-radius: 30px;
    margin: 0px;
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

  const loadFilesHandler = useCallback(
    (files) => {
      loadFiles(files).then((files) => {
        dispatch({ type: LOAD_DROP_FILES, files });
      });
    },
    [dispatch, loadFiles],
  );

  const onDrop = useCallback(
    (droppedFiles) => {
      dispatch({ type: SET_LOADING_FLAG, isLoading: true });
      loadFilesHandler(droppedFiles);
    },
    [dispatch, loadFilesHandler],
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    open: openImportDialog,
  } = useDropzone({
    onDrop,
    noClick: true,
  });

  const open = useCallback(() => {
    openImportDialog();
  }, [openImportDialog]);

  return (
    <LoaderProvider value={{ open }}>
      <div {...getRootProps()} css={containerStyle}>
        <input {...getInputProps()} />
        {isDragActive && (
          <div
            css={style}
            style={{ width: `${width + 41}px`, height: `${height}px` }}
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
