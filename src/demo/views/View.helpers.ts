import { useEffect, useState } from 'react';

import type { BaseViewProps } from './BaseView.js';

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

export interface ViewProps extends Omit<BaseViewProps, 'data'> {
  file: string;
  baseURL: string;
}

export function useView(props: ViewProps) {
  const [data, setData] = useState();

  const { file, baseURL, ...otherProps } = props;

  useEffect(() => {
    if (file) {
      void loadData(file).then((d) => {
        const _d = JSON.parse(JSON.stringify(d).replaceAll(/\.\/+?/g, baseURL));
        setData(_d);
      });
    } else {
      setData(undefined);
    }
  }, [baseURL, file]);

  return [data, otherProps] as const;
}
