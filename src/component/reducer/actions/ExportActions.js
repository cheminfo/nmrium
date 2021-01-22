import {
  exportAsJSON,
  exportAsSVG,
  exportAsPng,
  copyPNGToClipboard,
} from '../../utility/Export';
import { AnalysisObj } from '../core/Analysis';

function exportData(state, { exportType }) {
  const { data } = state;
  //check if there is data to export it
  if (data.length > 0) {
    //exported file name by default will be the first spectrum name
    const fileName = data[0].name;

    switch (exportType) {
      case 'json': {
        const exportedData = AnalysisObj.toJSON();
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
  return state;
}

export { exportData };
