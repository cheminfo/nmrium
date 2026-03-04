import type { NmriumState } from '@zakodium/nmrium-core';
import init from '@zakodium/nmrium-core-plugins';
import type { FileCollection } from 'file-collection';
import { useEffect, useState } from 'react';

import type { BaseViewProps } from './BaseView.js';
import BaseView from './BaseView.js';
import { Loading } from './Loading.js';

const core = init();

interface ExternalLoadViewProps extends Omit<BaseViewProps, 'data'> {
  file: string;
  baseURL: string;
}

async function loadSpectrumFromURL(url: string) {
  const { pathname: relativePath, origin: baseURL } = new URL(url);
  const source = {
    entries: [
      {
        relativePath,
      },
    ],
    baseURL,
  };

  return await core.readFromWebSource(source, {
    experimentalFeatures: true,
    onLoadProcessing: { autoProcessing: true },
  });
}

export default function ExternalLoadView(props: ExternalLoadViewProps) {
  const [data, setData] = useState<{
    state: Partial<NmriumState>;
    aggregator: FileCollection;
  }>();

  const { file, baseURL, ...otherProps } = props;

  useEffect(() => {
    void loadSpectrumFromURL(file).then(setData);
  }, [baseURL, file]);

  if (!data) {
    return <Loading />;
  }

  const { state, aggregator } = data;
  return <BaseView {...otherProps} state={state} aggregator={aggregator} />;
}
