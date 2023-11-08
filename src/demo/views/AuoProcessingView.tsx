import { fileCollectionFromWebSource } from 'filelist-utils';
import { read } from 'nmr-load-save';
import { useState, useEffect } from 'react';

import BaseView, { BaseViewProps } from './BaseView';
import { Loading } from './Loading';

export async function loadData(file) {
  const response = await fetch(file);
  checkStatus(response);
  const data = await response.json();
  return data;
}

function checkStatus(response) {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} - ${response.statusText}`);
  }
  return response;
}

interface ExternalLoadViewProps extends Omit<BaseViewProps, 'data'> {
  file: string;
  baseURL: string;
}

async function loadSpectrumFromURL(url) {
  const { pathname: relativePath, origin: baseURL } = new URL(url);
  const source = {
    entries: [
      {
        relativePath,
      },
    ],
    baseURL,
  };
  const fileCollection = await fileCollectionFromWebSource(source, {});

  const { nmriumState } = await read(fileCollection, {
    experimentalFeatures: true,
    onLoadProcessing: { autoProcessing: true },
  });
  return nmriumState;
}
export default function ExternalLoadView(props: ExternalLoadViewProps) {
  const [data, setData] = useState();

  const { file, baseURL, ...otherProps } = props;

  useEffect(() => {
    void loadSpectrumFromURL(file).then((d: any) => {
      setData(d);
    });
  }, [baseURL, file]);

  if (!data) {
    return <Loading />;
  }

  return <BaseView {...otherProps} data={data} />;
}
