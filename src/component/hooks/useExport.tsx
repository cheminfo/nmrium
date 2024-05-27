import { useCallback } from 'react';

import { ExportOptions, toJSON } from '../../data/SpectraManager';
import { useChartData } from '../context/ChartContext';
import { useGlobal } from '../context/GlobalContext';
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

export default function useExport() {
  const { rootRef } = useGlobal();
  const toaster = useToaster();
  const state = useChartData();
  const preferencesState = usePreferences();
  const saveToClipboardHandler = useCallback(async () => {
    if (state.data.length > 0 && rootRef) {
      const hideLoading = toaster.showLoading({
        message: 'Exporting as NMRium process in progress',
      });
      setTimeout(async () => {
        await copyPNGToClipboard(rootRef, 'nmrSVG');
        toaster.show({
          message: 'Image copied to clipboard',
          intent: 'success',
        });
        hideLoading();
      }, 0);
    }
  }, [state.data.length, rootRef, toaster]);

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

  const saveAsSVGHandler = useCallback(() => {
    if (state.data.length > 0 && rootRef) {
      const hideLoading = toaster.showLoading({
        message: 'Exporting as SVG process in progress',
      });
      void setTimeout(async () => {
        const fileName = state.data[0]?.info?.name;
        exportAsSVG(rootRef, 'nmrSVG', fileName);
        hideLoading();
      }, 0);
    }
  }, [state.data, rootRef, toaster]);

  const saveAsPNGHandler = useCallback(async () => {
    if (state.data.length > 0 && rootRef) {
      const hideLoading = toaster.showLoading({
        message: 'Exporting as PNG process in progress',
      });
      void setTimeout(async () => {
        const fileName = state.data[0]?.info?.name;
        exportAsPng(rootRef, 'nmrSVG', fileName);
        hideLoading();
      }, 0);
    }
  }, [state.data, rootRef, toaster]);

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
    saveToClipboardHandler,
    saveAsJSONHandler,
    saveAsSVGHandler,
    saveAsPNGHandler,
    saveHandler,
  };
}
