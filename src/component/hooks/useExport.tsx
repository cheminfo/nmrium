import { useCallback } from 'react';

import { ExportOptions, toJSON } from '../../data/SpectraManager';
import { useChartData } from '../context/ChartContext';
import { useGlobal } from '../context/GlobalContext';
import { usePreferences } from '../context/PreferencesContext';
import { useAlert } from '../elements/popup/Alert';
import { positions, useModal } from '../elements/popup/Modal';
import SaveAsModal from '../modal/SaveAsModal';
import {
  copyPNGToClipboard,
  exportAsJSON,
  exportAsPng,
  exportAsSVG,
} from '../utility/export';

export default function useExport() {
  const { rootRef } = useGlobal();
  const modal = useModal();
  const alert = useAlert();
  const state = useChartData();
  const preferencesState = usePreferences();
  const saveToClipboardHandler = useCallback(async () => {
    if (state.data.length > 0 && rootRef) {
      const hideLoading = await alert.showLoading(
        'Exporting as NMRium process in progress',
      );
      setTimeout(async () => {
        await copyPNGToClipboard(rootRef, 'nmrSVG');
        hideLoading();
        alert.success('Image copied to clipboard');
      }, 0);
    }
  }, [rootRef, alert, state]);

  const saveAsJSONHandler = useCallback(
    (spaceIndent = 0, isCompressed = true) => {
      alert
        .showLoading('Exporting as NMRium process in progress')
        .then((hideLoading) => {
          async function handle() {
            //exported file name by default will be the first spectrum name
            const fileName = state.data[0]?.info?.name;
            const exportedData = toJSON(state, preferencesState, {
              exportTarget: 'nmrium',
              view: true,
            });
            await exportAsJSON(
              exportedData,
              fileName,
              spaceIndent,
              isCompressed,
            );
            hideLoading();
          }
          setTimeout(() => {
            void handle();
          }, 0);
        })
        .catch(reportError);
    },
    [alert, preferencesState, state],
  );

  const saveAsSVGHandler = useCallback(async () => {
    if (state.data.length > 0 && rootRef) {
      const hideLoading = await alert.showLoading(
        'Exporting as SVG process in progress',
      );
      setTimeout(() => {
        const fileName = state.data[0]?.info?.name;
        exportAsSVG(rootRef, 'nmrSVG', fileName);
        hideLoading();
      }, 0);
    }
  }, [rootRef, alert, state.data]);

  const saveAsPNGHandler = useCallback(async () => {
    if (state.data.length > 0 && rootRef) {
      const hideLoading = await alert.showLoading(
        'Exporting as PNG process in progress',
      );
      setTimeout(() => {
        const fileName = state.data[0]?.info?.name;
        exportAsPng(rootRef, 'nmrSVG', fileName);
        hideLoading();
      }, 0);
    }
  }, [rootRef, alert, state.data]);

  interface SaveOptions {
    include: ExportOptions;
    name: string;
    compressed: boolean;
    pretty: boolean;
  }

  const saveHandler = useCallback(
    (options: SaveOptions) => {
      async function handler() {
        const { name, pretty, compressed, include } = options;
        const hideLoading = await alert.showLoading(
          `Exporting as ${name}.nmrium process in progress`,
        );
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
    [alert, preferencesState, state],
  );
  const saveAsHandler = useCallback(async () => {
    const fileName = state.data[0]?.info?.name;
    modal.show(<SaveAsModal name={fileName} onSave={saveHandler} />, {
      isBackgroundBlur: false,
      position: positions.TOP_CENTER,
      width: 500,
    });
  }, [modal, saveHandler, state.data]);

  return {
    saveToClipboardHandler,
    saveAsJSONHandler,
    saveAsSVGHandler,
    saveAsPNGHandler,
    saveAsHandler,
  };
}
