import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaUpload } from 'react-icons/fa';
/** @jsx jsx */
import { jsx, css } from '@emotion/core';

import { Analysis } from '../data/Analysis';

import {
  LOAD_MOL_FILE,
  LOAD_JSON_FILE,
  LOAD_JCAMP_FILE,
  SET_LOADING_FLAG,
} from './reducer/Actions';
import { useDispatch } from './context/DispatchContext';
import { useChartData } from './context/ChartContext';

function getFileExtension(file) {
  return file.name
    .substr(file.name.lastIndexOf('.'), file.name.length)
    .toLowerCase();
}

function getFileName(file) {
  return file.name.substr(0, file.name.lastIndexOf('.'));
}

function loadFiles(acceptedFiles) {
  return Promise.all(
    [].map.call(acceptedFiles, (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onabort = (e) => reject(e);
        reader.onerror = (e) => reject(e);
        reader.onload = () => {
          if (reader.result) {
            const binary = reader.result;
            const name = getFileName(file);
            const extension = getFileExtension(file);
            resolve({ binary, name, extension });
          }
        };
        reader.readAsBinaryString(file);
      });
    }),
  );
}

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
`;

const DropZone = (props) => {
  const { width, height } = useChartData();
  const dispatch = useDispatch();
  const onDrop = useCallback(
    (droppedFiles) => {
      dispatch({ type: SET_LOADING_FLAG, isLoading: true });

      const uniqueFileExtensions = [
        ...new Set(droppedFiles.map((file) => getFileExtension(file))),
      ];

      for (let extension of uniqueFileExtensions) {
        const selectedFilesByExtensions = droppedFiles.filter(
          (file) => getFileExtension(file) === extension,
        );

        switch (extension) {
          case '.mol':
            loadFiles(selectedFilesByExtensions).then(
              (files) => {
                dispatch({ type: LOAD_MOL_FILE, files });
              },
              (err) => {
                // eslint-disable-next-line no-alert
                alert(err);
              },
            );
            break;

          case '.json':
            if (selectedFilesByExtensions.length === 1) {
              loadFiles(selectedFilesByExtensions).then(
                // eslint-disable-next-line no-loop-func
                (files) => {
                  Analysis.build(JSON.parse(files[0].binary.toString())).then(
                    (AnalysisObj) => {
                      dispatch({ type: LOAD_JSON_FILE, data: { AnalysisObj } });
                    },
                  );
                },
                (err) => {
                  // eslint-disable-next-line no-alert
                  alert(err);
                },
              );
            } else {
              // eslint-disable-next-line no-alert
              alert('You can add only one json file');
            }

            break;

          case '.dx':
          case '.jdx':
            loadFiles(selectedFilesByExtensions).then(
              (files) => {
                dispatch({ type: LOAD_JCAMP_FILE, files });
              },
              (err) => {
                // eslint-disable-next-line no-alert
                alert(err);
              },
            );
            break;
          default:
            // eslint-disable-next-line no-alert
            alert('The file must be ( .dx,.jdx,.json,.mol ) extension');
            break;
        }
      }
    },
    [dispatch],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
  });

  return (
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
  );
};

export default DropZone;
