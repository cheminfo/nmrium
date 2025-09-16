import { useCallback } from 'react';

import type { ExportOptions } from '../../data/SpectraManager.js';
import { toJSON } from '../../data/SpectraManager.js';
import { useChartData } from '../context/ChartContext.js';
import { useCore } from '../context/CoreContext.js';
import { usePreferences } from '../context/PreferencesContext.js';
import { useToaster } from '../context/ToasterContext.js';
import {
  browserNotSupportedErrorToast,
  buildSelfContainedFile,
  copyPNGToClipboard,
  exportAsJsonBlob,
  exportAsPng,
  exportAsSVG,
  saveAs,
} from '../utility/export.js';

interface SaveOptions {
  include: ExportOptions;
  name: string;
  compressed: boolean;
  pretty: boolean;
}

export function useExport() {
  const toaster = useToaster();
  const state = useChartData();
  const preferencesState = usePreferences();
  const core = useCore();

  const saveAsJSONHandler = useCallback(
    (spaceIndent = 0, isCompressed = true) => {
      const hideLoading = toaster.showLoading({
        message: 'Exporting as NMRium process in progress',
      });
      setTimeout(async () => {
        try {
          const fileName = state.data[0]?.info?.name;
          const exportedData = toJSON(core, state, preferencesState, {
            exportTarget: 'nmrium',
            view: true,
          });

          const blob = await exportAsJsonBlob(
            exportedData,
            fileName,
            spaceIndent,
            isCompressed,
          );
          saveAs(blob, fileName);
        } catch (error) {
          toaster.show({
            intent: 'danger',
            message: `Export failed due to an unexpected error: ${(error as Error)?.message || 'Unknown error'}`,
          });
          reportError(error);
        } finally {
          hideLoading();
        }
      }, 0);
    },
    [core, preferencesState, state, toaster],
  );

  const saveHandler = useCallback(
    (options: SaveOptions) => {
      async function handler() {
        const { name, pretty, compressed, include } = options;
        const hideLoading = toaster.showLoading({
          message: `Exporting as ${name}.nmrium process in progress`,
        });
        setTimeout(async () => {
          try {
            const exportedData = toJSON(core, state, preferencesState, {
              ...include,
              exportTarget: 'nmrium',
            });
            const spaceIndent = pretty ? 2 : 0;
            const blob = await exportAsJsonBlob(
              exportedData,
              name,
              spaceIndent,
              compressed && !include.dataType?.startsWith('SELF_CONTAINED'),
            );

            if (!include.dataType?.startsWith('SELF_CONTAINED')) {
              return saveAs(blob, name);
            }

            const archive = await buildSelfContainedFile();
            saveAs(
              new Blob([archive], { type: 'application/zip' }),
              name,
              '.nmrium.zip',
            );
          } catch (error) {
            toaster.show({
              intent: 'danger',
              message: `Export failed due to an unexpected error: ${(error as Error)?.message || 'Unknown error'}`,
            });
            reportError(error);
          } finally {
            hideLoading();
          }
        }, 0);
      }

      void handler();
    },
    [core, preferencesState, state, toaster],
  );

  return {
    saveAsJSONHandler,
    saveHandler,
  };
}

export function useExportViewPort() {
  const toaster = useToaster();
  const state = useChartData();

  function copyPNGToClipboardHandler(targetElement: HTMLElement) {
    return new Promise<void>((resolve, reject) => {
      if (state.data.length === 0 || !targetElement) {
        return;
      }

      const hideLoading = toaster.showLoading({
        message: 'Exporting as NMRium process in progress',
      });

      setTimeout(async () => {
        try {
          await copyPNGToClipboard('nmrSVG', {
            rootElement: targetElement,
          });
          toaster.show({
            message: 'Image copied to clipboard',
            intent: 'success',
          });
          resolve();
        } catch (error: unknown) {
          if (error instanceof Error) {
            toaster.show({ intent: 'danger', message: error.message });
            reject(error);
          } else {
            toaster.show(browserNotSupportedErrorToast);
            // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
            reject(error);
          }
        } finally {
          hideLoading();
        }
      }, 0);
    });
  }

  function saveAsSVGHandler(targetElement: HTMLElement) {
    return new Promise<void>((resolve) => {
      if (state.data.length === 0 || !targetElement) {
        return;
      }

      const hideLoading = toaster.showLoading({
        message: 'Exporting as SVG process in progress',
      });
      void setTimeout(async () => {
        const fileName = state.data[0]?.info?.name;
        exportAsSVG('nmrSVG', {
          rootElement: targetElement,
          fileName,
        });
        hideLoading();
        resolve();
      }, 0);
    });
  }

  function saveAsPNGHandler(targetElement: HTMLElement) {
    return new Promise<void>((resolve, reject) => {
      if (state.data.length === 0 || !targetElement) {
        return;
      }

      const hideLoading = toaster.showLoading({
        message: 'Exporting as PNG process in progress',
      });
      void setTimeout(async () => {
        try {
          const fileName = state.data[0]?.info?.name;
          await exportAsPng('nmrSVG', {
            rootElement: targetElement,
            fileName,
          });
          resolve();
        } catch (error: unknown) {
          if (error instanceof Error) {
            toaster.show({ intent: 'danger', message: error.message });
            reject(error);
          } else {
            toaster.show(browserNotSupportedErrorToast);
            // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
            reject(error);
          }
        } finally {
          hideLoading();
        }
      }, 0);
    });
  }

  return {
    copyPNGToClipboardHandler,
    saveAsSVGHandler,
    saveAsPNGHandler,
  };
}
