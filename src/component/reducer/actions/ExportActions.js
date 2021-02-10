import { original } from 'immer';

import { toJSON } from '../../../data/SpectraManager';
import {
  exportAsJSON,
  exportAsSVG,
  exportAsPng,
  copyPNGToClipboard,
} from '../../utility/Export';

function exportData(draft, { exportType }) {
  const state = original(draft);
  //check if there is data to export it
  if (state.data.length > 0) {
    //exported file name by default will be the first spectrum name
    const fileName = state.data[0].name;

    switch (exportType) {
      case 'json': {
        const exportedData = toJSON(state);
        exportAsJSON(exportedData, fileName);
        break;
      }
      case 'svg': {
        exportAsSVG(fileName, 'nmrSVG');
        break;
      }
      case 'png': {
        exportAsPng(fileName, 'nmrSVG');
        break;
      }
      case 'copy': {
        copyPNGToClipboard('nmrSVG');
        break;
      }
      default:
        break;
    }
  }
}

export { exportData };
