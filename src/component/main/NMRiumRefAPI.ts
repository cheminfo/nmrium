import type { ForwardedRef, RefObject } from 'react';
import { useImperativeHandle } from 'react';

import { useCreateNmriumZip } from '../hooks/useCreateNmriumZip.ts';
import type { SaveIncludeOptions } from '../hooks/useExport.tsx';
import { useLoadFiles } from '../loader/useLoadFiles.js';
import type { BlobObject } from '../utility/export.js';
import { getBlob } from '../utility/export.js';

export interface NMRiumRefAPI {
  getSpectraViewerAsBlob: () => BlobObject | null;
  getNMRiumFile: (option: SaveIncludeOptions) => Promise<Blob>;
  loadFiles: (files: File[]) => void;
}

export function useNMRiumRefAPI(
  ref: ForwardedRef<NMRiumRefAPI>,
  rootRef: RefObject<HTMLDivElement>,
) {
  const loadFiles = useLoadFiles();
  const createNmriumZip = useCreateNmriumZip();

  useImperativeHandle(
    ref,
    () => ({
      getSpectraViewerAsBlob: () => {
        return rootRef.current
          ? getBlob('nmrSVG', { rootElement: rootRef.current })
          : null;
      },
      loadFiles,
      getNMRiumFile: (options) => createNmriumZip(options),
    }),
    [loadFiles, rootRef, createNmriumZip],
  );
}
