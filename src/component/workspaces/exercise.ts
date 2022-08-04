import { InnerWorkspace } from './Workspace';

export const exercise: InnerWorkspace = {
  version: 1,
  label: 'Exercise',
  display: {
    general: {
      hideGeneralSettings: true,
    },

    panels: {
      spectraPanel: { display: true, open: true },
      integralsPanel: { display: true },
    },

    toolBarButtons: {
      integralTool: true,
      spectraCenterAlignments: true,
      spectraStackAlignments: true,
      zoomOutTool: true,
      zoomTool: true,
    },
  },
};
