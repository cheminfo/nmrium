let baseURL = '';

export function setBaseUrl(newBaseUrl) {
  baseURL = newBaseUrl;
}

const help = {
  zoomIn: {
    tabTitle: '',
    ShowInGneralUserManual: false,
    text: 'Zoom Tool',
    filePath: `${baseURL}/1d/zoom/zoomIn.html`,
    index: 3,
  },
  peakPicking: {
    tabTitle: '',
    ShowInGneralUserManual: false,
    text: 'peak picking tool',
    filePath: `${baseURL}/1d/peak/peakPicking.html`,
    index: 2,
  },
  integralPicking: {
    tabTitle: '',
    ShowInGneralUserManual: false,
    text: 'integral tool',
    filePath: `${baseURL}/1d/integral/integration.html`,
    index: 3,
  },
  fullScreen: {
    tabTitle: '',
    ShowInGneralUserManual: false,
    text: 'Full Screen mode',
    filePath: `${baseURL}/1d/general/fullScreen.html`,
    index: 1,
  },
  loadSpectrum: {
    tabTitle: 'How To Import Spectrums',
    ShowInGneralUserManual: true,
    text: 'load spectrums',
    filePath: `${baseURL}/1d/load/loadSpectrum.html`,
    index: 0,
  },
};
export default help;
