import React, { useCallback, useContext } from 'react';
import { useDropzone } from 'react-dropzone';
import PublishRounded from '@material-ui/icons/PublishRounded';

import { useDispatch } from './context/DispatchContext';

import debug from 'debug';
import {
  LOAD_MOL_FILE,
  LOAD_JSON_FILE,
  LOAD_JCAMP_FILE,
} from './reducer/Actions';

import './css/drop-zone.css';
import { ChartContext } from './context/ChartContext';

const logger = new debug('development');

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
      logger(acceptedFiles);

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

const DropZone = (props) => {
  const { width, height } = useContext(ChartContext);
  const dispatch = useDispatch();

  const onDrop = useCallback(
    (droppedFiles) => {
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
                  // eslint-disable-next-line no-undef
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
              // eslint-disable-next-line no-loop-func
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
    <div
      {...getRootProps()}
      className={isDragActive ? 'main-container over' : 'main-container'}
    >
      <input {...getInputProps()} />
      {isDragActive && (
        <div
          className="drop-zoon-over"
          style={{ width: `${width + 41}px`, height: `${height}px` }}
        >
          <PublishRounded />
          <p>Drop your files here</p>
        </div>
      )}
      {props.children}
    </div>
  );
};

export default DropZone;
