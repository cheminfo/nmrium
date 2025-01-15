import styled from '@emotion/styled';
import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';
import * as dropzone from 'react-dropzone';
import { FaUpload } from 'react-icons/fa';

import { useChartData } from '../context/ChartContext.js';
import { LoaderProvider } from '../context/LoaderContext.js';
import { useCheckToolsVisibility } from '../hooks/useCheckToolsVisibility.js';
import { MetaImportationModal } from '../modal/metaImportation/MetaImportationModal.js';

import { useLoadFiles } from './useLoadFiles.js';

const DropContainer = styled.div`
  height: 100%;
  background-color: #b5b5b599;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-flow: column;
  z-index: 8;

  svg {
    stroke-width: 0;
    font-size: 3rem !important;
    fill: white;
  }
`;

const DropText = styled.p`
  color: white;
  background-color: rgb(104 104 104);
  padding: 1.5%;
  border-radius: 30px;
  margin: 0;
`;

const Container = styled.div`
  display: flex;
  height: 100%;
`;

interface DropZoneProps {
  children: ReactNode;
}

export default function DropZone(props: DropZoneProps) {
  const { width, height } = useChartData();
  const isToolEnabled = useCheckToolsVisibility();
  const [metaInformationFile, openMetaInformationDialog] =
    useState<File | null>();

  const loadFiles = useLoadFiles(openMetaInformationDialog);

  const isImportEnabled = isToolEnabled('import');

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    open: openImportDialog,
  } = dropzone.useDropzone({
    onDrop: loadFiles,
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
      {metaInformationFile && (
        <MetaImportationModal
          isOpen
          file={metaInformationFile}
          onCloseDialog={() => openMetaInformationDialog(null)}
        />
      )}
      <Container {...getRootProps()} role="none">
        <input {...getInputProps()} />
        {isDragActive && (
          <DropContainer
            style={{
              width: `${width}px`,
              height: `${height}px`,
              marginTop: '30px',
              marginLeft: '30px',
            }}
          >
            <FaUpload />
            <DropText>Drop your files here</DropText>
          </DropContainer>
        )}
        {props.children}
      </Container>
    </LoaderProvider>
  );
}
