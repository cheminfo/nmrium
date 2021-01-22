let baseURL = '';

export function setBaseUrl(newBaseUrl) {
  baseURL = newBaseUrl;
}

function getHelpList() {
  return {
    zoomIn: {
      text: 'Zoom Tool',
      filePath: `${baseURL}/1d/zoom/zoomIn.html`,
    },
    peakPicking: {
      text: 'peak picking tool',
      filePath: `${baseURL}/1d/peak/peakPicking.html`,
    },
    integralPicking: {
      text: 'integral tool',
      filePath: `${baseURL}/1d/integral/integration.html`,
    },
    fullScreen: {
      text: 'Full Screen mode',
      filePath: `${baseURL}/1d/general/fullScreen.html`,
    },
    loadSpectrum: {
      text: 'load spectrums',
      filePath: `${baseURL}/1d/load/loadSpectrum.html`,
    },
  };
}
export default getHelpList;
