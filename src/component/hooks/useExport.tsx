import { UniversalExportSettings } from 'nmr-load-save';
import { useCallback } from 'react';

import { ExportOptions, toJSON } from '../../data/SpectraManager';
import { useChartData } from '../context/ChartContext';
import { usePreferences } from '../context/PreferencesContext';
import { useToaster } from '../context/ToasterContext';
import {
  copyPNGToClipboard,
  exportAsJSON,
  exportAsPng,
  exportAsSVG,
} from '../utility/export';

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

  const saveAsJSONHandler = useCallback(
    (spaceIndent = 0, isCompressed = true) => {
      const hideLoading = toaster.showLoading({
        message: 'Exporting as NMRium process in progress',
      });

      try {
        void (async () => {
          const fileName = state.data[0]?.info?.name;
          const exportedData = toJSON(state, preferencesState, {
            exportTarget: 'nmrium',
            view: true,
          });

          await exportAsJSON(exportedData, fileName, spaceIndent, isCompressed);
          hideLoading();
        })();
      } catch (error) {
        reportError(error);
      }
    },
    [preferencesState, state, toaster],
  );

  const saveHandler = useCallback(
    (options: SaveOptions) => {
      async function handler() {
        const { name, pretty, compressed, include } = options;
        const hideLoading = toaster.showLoading({
          message: `Exporting as ${name}.nmrium process in progress`,
        });
        setTimeout(() => {
          void (async () => {
            const exportedData = toJSON(state, preferencesState, {
              ...include,
              exportTarget: 'nmrium',
            });
            const spaceIndent = pretty ? 2 : 0;
            await exportAsJSON(exportedData, name, spaceIndent, compressed);
            hideLoading();
          })();
        }, 0);
      }

      void handler();
    },
    [preferencesState, state, toaster],
  );

  return {
    saveAsJSONHandler,
    saveHandler,
  };
}

export function useExportViewPort() {
  const toaster = useToaster();
  const state = useChartData();

  function copyPNGToClipboardHandler(
    targetElement: HTMLElement,
    options: Partial<UniversalExportSettings>,
  ) {
    return new Promise<void>((resolve) => {
      if (state.data.length === 0 || !targetElement) {
        return;
      }

      const hideLoading = toaster.showLoading({
        message: 'Exporting as NMRium process in progress',
      });

      setTimeout(async () => {
        await copyPNGToClipboard('nmrSVG', {
          rootElement: targetElement,
          ...options,
        });
        toaster.show({
          message: 'Image copied to clipboard',
          intent: 'success',
        });
        hideLoading();
        resolve();
      }, 0);
    });
  }

  function saveAsSVGHandler(
    targetElement: HTMLElement,
    options: Partial<UniversalExportSettings>,
  ) {
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
          ...options,
        });
        hideLoading();
        resolve();
      }, 0);
    });
  }

  function saveAsPNGHandler(
    targetElement: HTMLElement,
    options: Partial<UniversalExportSettings>,
  ) {
    return new Promise<void>((resolve) => {
      if (state.data.length === 0 || !targetElement) {
        return;
      }

      const hideLoading = toaster.showLoading({
        message: 'Exporting as PNG process in progress',
      });
      void setTimeout(async () => {
        const fileName = state.data[0]?.info?.name;
        void exportAsPng('nmrSVG', {
          rootElement: targetElement,
          fileName,
          ...options,
        });
        hideLoading();
        resolve();
      }, 0);
    });
  }

  return {
    copyPNGToClipboardHandler,
    saveAsSVGHandler,
    saveAsPNGHandler,
  };
}
