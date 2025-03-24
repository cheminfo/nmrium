import { fileCollectionFromWebSource } from 'filelist-utils';
import { read } from 'nmr-load-save';
import { useEffect, useState } from 'react';

import type { BaseViewProps } from './BaseView.js';
import BaseView from './BaseView.js';
import { Loading } from './Loading.js';

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
