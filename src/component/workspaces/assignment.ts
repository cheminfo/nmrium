import { InnerWorkspace } from './Workspace';

export const assignment: InnerWorkspace = {
  version: 2,
  label: 'Assignment',
  display: {
    panels: {
      spectraPanel: { display: true, open: true },
      informationPanel: { display: true, open: false },
      rangesPanel: { display: true, open: false },
      structuresPanel: { display: true, open: false },
      filtersPanel: { display: true, open: false },
      zonesPanel: { display: true, open: false },
    },
    toolBarButtons: {
      zoom: true,
      zoomOut: true,
      import: true,
      exportAs: true,
      spectraStackAlignments: true,
      spectraCenterAlignments: true,
      realImaginary: true,
      zonePicking: true,
      rangePicking: true,
      slicing: true,
      apodization: true,
      zeroFilling: true,
      fastFourierTransform: true,
      phaseCorrection: true,
      baselineCorrection: true,
    },
  },
};
