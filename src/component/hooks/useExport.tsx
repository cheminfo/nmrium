import type { NmriumState } from '@zakodium/nmrium-core';
import { useCallback } from 'react';

import type { ExportOptions } from '../../data/SpectraManager.js';
import { toJSON } from '../../data/SpectraManager.js';
import { useChartData } from '../context/ChartContext.js';
import { useCore } from '../context/CoreContext.js';
import { usePreferences } from '../context/PreferencesContext.js';
import { useToaster } from '../context/ToasterContext.js';
import {
  browserNotSupportedErrorToast,
  copyPNGToClipboard,
  exportAsPng,
  exportAsSVG,
} from '../utility/export.js';
import { saveAs } from '../utility/save_as.ts';

export interface SaveOptions {
  include: Pick<ExportOptions, 'dataType' | 'settings' | 'view'>;
  name: string;
}

export function useExport() {
  const toaster = useToaster();
  const state = useChartData();
  const preferencesState = usePreferences();
  const core = useCore();

  const saveHandler = useCallback(
    (options: SaveOptions) => {
      async function handler() {
        const name = options.name || 'experiment';
        const include = options.include;

        const hideLoading = toaster.showLoading({
          message: `Exporting as ${name}.nmrium.zip process in progress`,
        });
        setTimeout(async () => {
          try {
            const nmriumState = toJSON(core, state, preferencesState, {
              serialize: false,
              exportTarget: 'nmrium',
            }) as NmriumState;
            const archive = await core.serializeNmriumArchive({
              state: nmriumState,
              aggregator: state.aggregator,
              includeData: include.dataType === 'SELF_CONTAINED',
              includeSettings: include.settings,
              includeView: include.view,
            });
            const zipBlob = new Blob([archive], {
              type: 'chemical/x-nmrium+zip',
            });
            saveAs({ blob: zipBlob, name, extension: '.nmrium.zip' });
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

  const defaultName = state.data[0]?.info?.name || 'experiment';
  const defaultSaveAsHandler = useCallback(() => {
    saveHandler({
      name: defaultName,
      include: {
        dataType: 'SELF_CONTAINED',
        view: true,
        settings: false,
      },
    });
  }, [saveHandler, defaultName]);

  return {
    defaultSaveAsHandler,
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
