import { useCallback } from 'react';

import { toJSON } from '../../data/SpectraManager';
import { useChartData } from '../context/ChartContext';
import { useAlert } from '../elements/popup/Alert';
import {
  copyPNGToClipboard,
  exportAsJSON,
  exportAsNMRE,
  exportAsPng,
  exportAsSVG,
} from '../utility/Export';
import { toNmredata } from '../utility/toNmredata';

export default function useExport() {
  const alert = useAlert();
  const state = useChartData();

  const saveToClipboardHandler = useCallback(async () => {
    if (state.data.length > 0) {
      const hideLoading = await alert.showLoading(
        'Exporting as numrium process in progress',
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
          'Exporting as numrium process in progress',
        );
        setTimeout(async () => {
          //exported file name by default will be the first spectrum name
          const fileName = state.data[0]?.display?.name;
          const exportedData = toJSON(state);
          await exportAsJSON(exportedData, fileName, spaceIndent, isCompressed);
          hideLoading();
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
        const fileName = state.data[0]?.display?.name;
        const exportedData = toNmredata(state);
        exportAsNMRE(exportedData, fileName);
        hideLoading();
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
        exportAsSVG(fileName, 'nmrSVG');
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
        exportAsPng(fileName, 'nmrSVG');
        hideLoading();
      }, 0);
    }
  }, [alert, state.data]);

  return {
    saveToClipboardHandler,
    saveAsJSONHandler,
    saveAsNMREHandler,
    saveAsSVGHandler,
    saveAsPNGHandler,
  };
}
