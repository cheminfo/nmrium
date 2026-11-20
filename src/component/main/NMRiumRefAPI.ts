import type { FileCollection } from 'file-collection';
import type { Ref, RefObject } from 'react';
import { useImperativeHandle } from 'react';

import { useExportManagerAPI } from '../elements/export/ExportManager.js';
import { useCreateNmriumZip } from '../hooks/useCreateNmriumZip.ts';
import type { SaveIncludeOptions } from '../hooks/useExport.tsx';
import { useLoadFiles } from '../loader/useLoadFiles.js';
import type { BlobObject } from '../utility/export.js';
import { getBlob } from '../utility/export.js';

export interface NMRiumRefAPI {
  /**
   * The spectra viewer as it is drawn on screen, without the floating
   * molecules, ranges, publication strings and insets.
   */
  getSpectraViewerAsBlob: () => BlobObject | null;
  /**
   * The spectra viewer as an SVG, the way "Export as SVG" draws it: the
   * spectra together with the floating molecules, ranges, publication strings
   * and insets, at the size of the viewer.
   * @returns The SVG, or `null` when there is no spectrum to draw.
   */
  exportSpectraViewerAsBlob: () => Promise<BlobObject | null>;
  getNMRiumFile: (option: SaveIncludeOptions) => Promise<Blob>;
  loadFiles: (files: File[]) => void;
  loadFileCollection: (fileCollection: FileCollection) => void;
}

export function useNMRiumRefAPI(
  ref: Ref<NMRiumRefAPI> | undefined,
  rootRef: RefObject<HTMLDivElement | null>,
) {
  const loadFiles = useLoadFiles();
  const createNmriumZip = useCreateNmriumZip();
  const exportManager = useExportManagerAPI();

  useImperativeHandle(
    ref,
    () => ({
      getSpectraViewerAsBlob: () => {
        return rootRef.current
          ? getBlob('nmrSVG', { rootElement: rootRef.current })
          : null;
      },
      exportSpectraViewerAsBlob: () =>
        new Promise<BlobObject | null>((resolve) => {
          const manager = exportManager.current;
          if (!manager) {
            resolve(null);
            return;
          }
          manager.export({
            format: 'svg',
            destination: 'blob',
            onBlob: resolve,
          });
        }),
      loadFiles,
      loadFileCollection: (fileCollection: FileCollection) =>
        loadFiles(fileCollection),
      getNMRiumFile: (options) => createNmriumZip(options),
    }),
    [loadFiles, rootRef, createNmriumZip, exportManager],
  );
}
