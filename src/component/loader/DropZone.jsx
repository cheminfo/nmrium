/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import Zip from 'jszip';
import { createRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaUpload } from 'react-icons/fa';

import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import {
  LOAD_MOL_FILE,
  LOAD_JSON_FILE,
  LOAD_JCAMP_FILE,
  SET_LOADING_FLAG,
  LOAD_ZIP_FILE,
  LOAD_JDF_FILE,
} from '../reducer/types/Types';
import {
  FILES_TYPES,
  getFileExtension,
  loadFiles,
  loadFilesFromZip,
} from '../utility/FileUtility';

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

export const DropZoneRef = createRef();

function DropZone(props) {
  const { width, height } = useChartData();
  const dispatch = useDispatch();
  const loadsubFilesfromZip = useCallback(
    (extractedfiles, uniqueFileExtensions) => {
      for (let extension of uniqueFileExtensions) {
        const selectedFilesByExtensions = extractedfiles.filter(
          (file) => getFileExtension(file.name) === extension,
        );

        switch (extension) {
          case FILES_TYPES.MOL:
            loadFilesFromZip(selectedFilesByExtensions).then((files) =>
              dispatch({ type: LOAD_MOL_FILE, files }),
            );

            break;
          case FILES_TYPES.NMRIUM:
          case FILES_TYPES.JSON:
            loadFilesFromZip(selectedFilesByExtensions).then((files) => {
              if (selectedFilesByExtensions.length === 1) {
                dispatch({ type: LOAD_JSON_FILE, files });
              } else {
                dispatch({ type: SET_LOADING_FLAG, isLoading: false });
                // eslint-disable-next-line no-alert
                alert('You can add only one json file');
              }
            });
            break;

          case FILES_TYPES.JDX:
          case FILES_TYPES.DX:
            loadFilesFromZip(selectedFilesByExtensions).then((files) =>
              dispatch({ type: LOAD_JCAMP_FILE, files }),
            );

            break;
          case FILES_TYPES.JDF:
            loadFilesFromZip(selectedFilesByExtensions, {
              asBuffer: true,
            }).then((files) => dispatch({ type: LOAD_JDF_FILE, files }));
            break;

          default:
            break;
        }
      }
    },
    [dispatch],
  );

  const loadFilesHandler = useCallback(
    (files) => {
      const uniqueFileExtensions = [
        ...new Set(files.map((file) => getFileExtension(file.name))),
      ];

      for (let extension of uniqueFileExtensions) {
        const selectedFilesByExtensions = files.filter(
          (file) => getFileExtension(file.name) === extension,
        );

        switch (extension) {
          case FILES_TYPES.MOL:
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
          case FILES_TYPES.NMRIUM:
          case FILES_TYPES.JSON:
            if (selectedFilesByExtensions.length === 1) {
              loadFiles(selectedFilesByExtensions).then(
                (files) => {
                  dispatch({ type: LOAD_JSON_FILE, files });
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

          case FILES_TYPES.JDX:
          case FILES_TYPES.DX:
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
          case FILES_TYPES.JDF:
            loadFiles(selectedFilesByExtensions, { asBuffer: true }).then(
              (files) => {
                dispatch({ type: LOAD_JDF_FILE, files });
              },
              (err) => {
                // eslint-disable-next-line no-alert
                alert(err);
              },
            );
            break;
          case FILES_TYPES.ZIP:
            loadFiles(selectedFilesByExtensions).then(
              async (files) => {
                for (const zipFile of files) {
                  const unzipResult = await Zip.loadAsync(zipFile.binary);

                  const uniqueFileExtensions = [
                    ...new Set(
                      Object.values(unzipResult.files).map((file) =>
                        getFileExtension(file.name),
                      ),
                    ),
                  ];

                  const isNotZip = uniqueFileExtensions.some(
                    (ex) =>
                      FILES_TYPES[ex.toUpperCase()] && ex !== FILES_TYPES.ZIP,
                  );

                  if (isNotZip) {
                    loadsubFilesfromZip(
                      Object.values(unzipResult.files),
                      uniqueFileExtensions,
                    );
                  } else {
                    dispatch({ type: LOAD_ZIP_FILE, files });
                  }
                }
              },
              (err) => {
                // eslint-disable-next-line no-alert
                alert(err);
              },
            );
            break;
          default:
            // eslint-disable-next-line no-alert
            alert(
              'The file extension must be zip, dx, jdx, json, mol or nmrium.',
            );
            break;
        }
      }
    },
    [dispatch, loadsubFilesfromZip],
  );

  const onDrop = useCallback(
    (droppedFiles) => {
      dispatch({ type: SET_LOADING_FLAG, isLoading: true });
      loadFilesHandler(droppedFiles);
    },
    [dispatch, loadFilesHandler],
  );

  DropZoneRef.current = useDropzone({
    onDrop,
    noClick: true,
  });

  const { getRootProps, getInputProps, isDragActive } = DropZoneRef.current;

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
}

export default DropZone;
