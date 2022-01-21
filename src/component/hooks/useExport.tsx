import { useCallback } from 'react';

import { toJSON } from '../../data/SpectraManager';
import { useChartData } from '../context/ChartContext';
import { useAlert } from '../elements/popup/Alert';
import { positions, useModal } from '../elements/popup/Modal';
import SaveAsModal from '../modal/SaveAsModal';
import {
  copyPNGToClipboard,
  exportAsJSON,
  exportAsNMRE,
  exportAsPng,
  exportAsSVG,
} from '../utility/Export';
import { nmriumToNmredata } from '../utility/nmriumToNmredata';

export default function useExport() {
  const modal = useModal();
  const alert = useAlert();
  const state = useChartData();

  const saveToClipboardHandler = useCallback(async () => {
    if (state.data.length > 0) {
      const hideLoading = await alert.showLoading(
        'Exporting as NMRium process in progress',
      );
      setTimeout(() => {
        copyPNGToClipboard('nmrSVG');
        hideLoading();
        alert.success('Image copied to clipboard');
      }, 0);
    }
  }, [alert, state]);

  const saveAsJSONHandler = useCallback(
    async (spaceIndent = 0, isCompressed = true) => {
      if (state.data.length > 0) {
        const hideLoading = await alert.showLoading(
          'Exporting as NMRium process in progress',
        );

        setTimeout(() => {
          async function handle() {
            //exported file name by default will be the first spectrum name
            const fileName = state.data[0]?.display?.name;
            const exportedData = toJSON(state);
            await exportAsJSON(
              exportedData,
              fileName,
              spaceIndent,
              isCompressed,
            );
            hideLoading();
          }

          void handle();
        }, 0);
      }
    },
    [alert, state],
  );

  const saveAsNMREHandler = useCallback(async () => {
    if (state.data.length > 0) {
      const hideLoading = await alert.showLoading(
        'Exporting as NMRE process in progress',
      );
      setTimeout(() => {
        async function handle() {
          const fileName = state.data[0]?.display?.name;
          const exportedData = await nmriumToNmredata(state);
          exportAsNMRE(exportedData, fileName);
          hideLoading();
        }

        void handle();
      }, 0);
    }
  }, [alert, state]);

  const saveAsSVGHandler = useCallback(async () => {
    if (state.data.length > 0) {
      const hideLoading = await alert.showLoading(
        'Exporting as SVG process in progress',
      );
      setTimeout(() => {
        const fileName = state.data[0]?.display?.name;
        exportAsSVG('nmrSVG', fileName);
        hideLoading();
      }, 0);
    }
  }, [alert, state.data]);

  const saveAsPNGHandler = useCallback(async () => {
    if (state.data.length > 0) {
      const hideLoading = await alert.showLoading(
        'Exporting as PNG process in progress',
      );
      setTimeout(() => {
        const fileName = state.data[0]?.display?.name;
        exportAsPng('nmrSVG', fileName);
        hideLoading();
      }, 0);
    }
  }, [alert, state.data]);

  const saveHandler = useCallback(
    async (options) => {
      const { name, pretty, compressed, dataExportOption } = options;
      const hideLoading = await alert.showLoading(
        `Exporting as ${name}.nmrium process in progress`,
      );
      setTimeout(() => {
        async function handle() {
          const exportedData = toJSON(state, dataExportOption);
          const spaceIndent = pretty ? 2 : 0;
          await exportAsJSON(exportedData, name, spaceIndent, compressed);
          hideLoading();
        }

        void handle();
      }, 0);
    },
    [alert, state],
  );
  const saveAsHandler = useCallback(async () => {
    if (state.data.length > 0) {
      const fileName = state.data[0]?.display?.name;
      modal.show(<SaveAsModal name={fileName} onSave={saveHandler} />, {
        isBackgroundBlur: false,
        position: positions.TOP_CENTER,
        width: 400,
      });
    }
  }, [modal, saveHandler, state.data]);

  return {
    saveToClipboardHandler,
    saveAsJSONHandler,
    saveAsNMREHandler,
    saveAsSVGHandler,
    saveAsPNGHandler,
    saveAsHandler,
  };
}
