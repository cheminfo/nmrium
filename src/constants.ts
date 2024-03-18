export const docsBaseUrl = 'https://docs.nmrium.org';

export const helpList: Record<string, { text: string; url: string }> = {
  zoom: {
    text: 'Zoom tool',
    url: `${docsBaseUrl}/help/zoom-and-scale`,
  },
  peakPicking: {
    text: 'Peak picking tool',
    url: `${docsBaseUrl}/help/peaks`,
  },
  integralPicking: {
    text: 'Integral tool',
    url: `${docsBaseUrl}/help/integrations`,
  },
  fullScreen: {
    text: 'Full screen mode',
    url: `${docsBaseUrl}/help/general`,
  },
  loadSpectrum: {
    text: 'Load spectra',
    url: `${docsBaseUrl}/help/loading-a-spectrum`,
  },
};
