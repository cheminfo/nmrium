export const docsBaseUrl = 'https://docs.nmrium.org';

export const helpList: Record<string, { text: string; url: string }> = {
  zoomIn: {
    text: 'Zoom Tool',
    url: `${docsBaseUrl}/help/zoom-and-scale`,
  },
  peakPicking: {
    text: 'peak picking tool',
    url: `${docsBaseUrl}/help/peaks`,
  },
  integralPicking: {
    text: 'integral tool',
    url: `${docsBaseUrl}/help/integrations`,
  },
  fullScreen: {
    text: 'Full Screen mode',
    url: `${docsBaseUrl}/help/general`,
  },
  loadSpectrum: {
    text: 'load spectrums',
    url: `${docsBaseUrl}/help/loading-a-spectrum`,
  },
};
