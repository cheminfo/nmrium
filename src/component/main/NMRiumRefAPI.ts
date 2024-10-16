import type { ForwardedRef, RefObject } from 'react';
import { useImperativeHandle } from 'react';

import { useLoadFiles } from '../loader/useLoadFiles.js';
import type { BlobObject } from '../utility/export.js';
import { getBlob } from '../utility/export.js';

export interface NMRiumRefAPI {
  getSpectraViewerAsBlob: () => BlobObject | null;
  loadFiles: (files: File[]) => void;
}

export function useNMRiumRefAPI(
  ref: ForwardedRef<NMRiumRefAPI>,
  rootRef: RefObject<HTMLDivElement>,
) {
  const loadFiles = useLoadFiles();
  useImperativeHandle(
    ref,
    () => ({
      getSpectraViewerAsBlob: () => {
        return rootRef.current
          ? getBlob('nmrSVG', { rootElement: rootRef.current })
          : null;
      },
      loadFiles,
    }),
    [rootRef, loadFiles],
  );
}
