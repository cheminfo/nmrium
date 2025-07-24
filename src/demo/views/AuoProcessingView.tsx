import type { NMRiumCore } from '@zakodium/nmrium-core';
import { FileCollection } from 'file-collection';
import { useEffect, useState } from 'react';

import { useCore } from '../../component/context/CoreContext.js';

import type { BaseViewProps } from './BaseView.js';
import BaseView from './BaseView.js';
import { Loading } from './Loading.js';

interface ExternalLoadViewProps extends Omit<BaseViewProps, 'data'> {
  file: string;
  baseURL: string;
}

async function loadSpectrumFromURL(core: NMRiumCore, url: string) {
  const { pathname: relativePath, origin: baseURL } = new URL(url);
  const source = {
    entries: [
      {
        relativePath,
      },
    ],
    baseURL,
  };
  const fileCollection = await new FileCollection().appendSource(source);

  const { nmriumState } = await core.read(fileCollection, {
    experimentalFeatures: true,
    onLoadProcessing: { autoProcessing: true },
  });
  return nmriumState;
}

export default function ExternalLoadView(props: ExternalLoadViewProps) {
  const [data, setData] = useState();
  const core = useCore();

  const { file, baseURL, ...otherProps } = props;

  useEffect(() => {
    void loadSpectrumFromURL(core, file).then((d: any) => {
      setData(d);
    });
  }, [baseURL, core, file]);

  if (!data) {
    return <Loading />;
  }

  return <BaseView {...otherProps} data={data} />;
}
