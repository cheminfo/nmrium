import { InnerWorkspace } from './Workspace';

export const embedded: InnerWorkspace = {
  version: 1,
  label: 'Embedded workspace',
  display: {
    general: {
      experimentalFeatures: { display: true },
      hidePanelOnLoad: true,
    },

    panels: {
      spectraPanel: { display: true, open: true },
      informationPanel: { display: true, open: false },
      peaksPanel: { display: true, open: false },
      integralsPanel: { display: true, open: false },
      rangesPanel: { display: true, open: false },
      structuresPanel: { display: true, open: false },
      filtersPanel: { display: true, open: false },
      zonesPanel: { display: true, open: false },
    },
    toolBarButtons: {
      baselineCorrectionTool: true,
      exclusionZonesTool: true,
      exportAs: true,
      FFTTool: true,
      import: true,
      integralTool: true,
      multipleSpectraAnalysisTool: true,
      phaseCorrectionTool: true,
      rangePickingTool: true,
      realImaginary: true,
      slicingTool: true,
      spectraCenterAlignments: true,
      spectraStackAlignments: true,
      zeroFillingTool: true,
      zonePickingTool: true,
      zoomOutTool: true,
      zoomTool: true,
    },
  },
};
