export const docsBaseUrl = 'https://docs.nmrium.org';

export const helpList: Record<string, { text: string; filePath: string }> = {
  zoomIn: {
    text: 'Zoom Tool',
    filePath: `${docsBaseUrl}/help/zoom-and-scale`,
  },
  peakPicking: {
    text: 'peak picking tool',
    filePath: `${docsBaseUrl}/help/peaks`,
  },
  integralPicking: {
    text: 'integral tool',
    filePath: `${docsBaseUrl}/help/integrations`,
  },
  fullScreen: {
    text: 'Full Screen mode',
    filePath: `${docsBaseUrl}/help/general`,
  },
  loadSpectrum: {
    text: 'load spectrums',
    filePath: `${docsBaseUrl}/help/loading-a-spectrum`,
  },
};
