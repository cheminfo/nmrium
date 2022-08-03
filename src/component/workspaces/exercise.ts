import { InnerWorkspace } from './Workspace';

export const exercise: InnerWorkspace = {
  version: 1,
  label: 'Exercise',
  display: {
    general: {
      hideSetSumFromMolecule: true,
      hideGeneralSettings: true,
    },

    panels: {
      spectraPanel: { display: true, open: true },
      integralsPanel: { display: true },
    },

    toolBarButtons: {
      integral: true,
      spectraCenterAlignments: true,
      spectraStackAlignments: true,
      zoomOut: true,
      zoom: true,
    },
  },
};
