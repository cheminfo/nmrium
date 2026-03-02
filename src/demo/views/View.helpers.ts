import type { NmriumState } from '@zakodium/nmrium-core';
import type { FileCollection } from 'file-collection';
import { useEffect, useState } from 'react';

import { demoCore } from '../utility/core.ts';

import type { BaseViewProps } from './BaseView.js';

export async function loadData(file: string | URL, baseURL?: string) {
  const response = await fetch(file);
  checkStatus(response);
  const nmriumObject = await response.json();

  if (baseURL === './') baseURL = window.location.href;
  const [state, aggregator] = await demoCore.readNMRiumObject(
    nmriumObject,
    undefined,
    { baseURL },
  );
  return { state, aggregator };
}

function checkStatus(response: any) {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} - ${response.statusText}`);
  }
  return response;
}

export interface ViewProps extends Omit<BaseViewProps, 'data'> {
  file: string;
  baseURL: string;
}

export function useView(props: ViewProps) {
  const [data, setData] = useState<{
    state: Partial<NmriumState>;
    aggregator: FileCollection;
  }>();

  const { file, baseURL, ...otherProps } = props;

  if (!file && data !== undefined) {
    setData(undefined);
  }

  useEffect(() => {
    if (file) {
      void loadData(file, baseURL).then(setData);
    }
  }, [baseURL, file]);

  return [data, otherProps] as const;
}
