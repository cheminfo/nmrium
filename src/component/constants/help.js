function getHelpList(baseURL) {
  return {
    zoomIn: {
      text: 'Zoom Tool',
      filePath: `${baseURL}/help/zoom-and-scale`,
    },
    peakPicking: {
      text: 'peak picking tool',
      filePath: `${baseURL}/help/peaks`,
    },
    integralPicking: {
      text: 'integral tool',
      filePath: `${baseURL}/help/integrations`,
    },
    fullScreen: {
      text: 'Full Screen mode',
      filePath: `${baseURL}/help/general`,
    },
    loadSpectrum: {
      text: 'load spectrums',
      filePath: `${baseURL}/help/loading-a-spectrum`,
    },
  };
}
export default getHelpList;
