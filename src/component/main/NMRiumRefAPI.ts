import { ForwardedRef, RefObject, useImperativeHandle } from 'react';

import { useLoadFiles } from '../loader/useLoadFiles';
import { BlobObject, getBlob } from '../utility/export';

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
